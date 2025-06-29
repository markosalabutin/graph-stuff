import type { VertexId, Weight } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';
import { PriorityQueue } from '../utils/PriorityQueue';

export type ShortestPathAlgorithm = 'dijkstra' | 'bellman-ford';

export interface ShortestPathResult {
  distances: Map<VertexId, number>;
  predecessors: Map<VertexId, VertexId | null>;
  path: VertexId[];
  totalDistance: number;
  hasNegativeCycle?: boolean;
}

export interface ShortestPathError {
  type: 'validation' | 'negative_cycle' | 'unreachable' | 'negative_weights';
  message: string;
}

export class ShortestPathService {
  private static validateGraph(
    graph: GraphAPI,
    algorithm: ShortestPathAlgorithm
  ): ShortestPathError | null {
    const vertices = graph.getVertices();

    if (vertices.length < 2) {
      return {
        type: 'validation',
        message: 'Shortest path computation requires at least 2 vertices',
      };
    }

    if (algorithm === 'dijkstra') {
      const edges = graph.getEdges();
      for (const edge of edges) {
        if (edge.weight < 0) {
          return {
            type: 'negative_weights',
            message:
              'Dijkstra algorithm cannot handle negative edge weights. Use Bellman-Ford instead.',
          };
        }
      }
    }

    return null;
  }

  private static isReachable(
    graph: GraphAPI,
    source: VertexId,
    target: VertexId
  ): boolean {
    if (source === target) {
      return true;
    }

    const visited = new Set<VertexId>();
    const queue = [source];
    const edges = graph.getEdges();
    const isDirected = graph.getGraphType() === 'directed';

    const adjacencyList = new Map<VertexId, VertexId[]>();
    for (const edge of edges) {
      // Add forward edge
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push(edge.target);

      // For undirected graphs, add reverse edge
      if (!isDirected) {
        if (!adjacencyList.has(edge.target)) {
          adjacencyList.set(edge.target, []);
        }
        adjacencyList.get(edge.target)!.push(edge.source);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === target) {
        return true;
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return false;
  }

  private static reconstructPath(
    predecessors: Map<VertexId, VertexId | null>,
    source: VertexId,
    target: VertexId
  ): VertexId[] {
    const path: VertexId[] = [];
    let current: VertexId | null = target;

    while (current !== null) {
      path.unshift(current);
      current = predecessors.get(current) || null;

      if (path.length > predecessors.size + 1) {
        break;
      }
    }

    if (path.length === 0 || path[0] !== source) {
      return [];
    }

    return path;
  }

  static dijkstra(
    graph: GraphAPI,
    source: VertexId,
    target: VertexId,
    isWeighted: boolean = true
  ): ShortestPathResult | ShortestPathError {
    const validationError = this.validateGraph(graph, 'dijkstra');
    if (validationError) {
      return validationError;
    }

    const vertices = graph.getVertices();

    if (!vertices.includes(source)) {
      return {
        type: 'validation',
        message: `Source vertex "${source}" does not exist in the graph`,
      };
    }

    if (!vertices.includes(target)) {
      return {
        type: 'validation',
        message: `Target vertex "${target}" does not exist in the graph`,
      };
    }

    if (source === target) {
      return {
        distances: new Map([[source, 0]]),
        predecessors: new Map([[source, null]]),
        path: [source],
        totalDistance: 0,
      };
    }

    if (!this.isReachable(graph, source, target)) {
      return {
        type: 'unreachable',
        message: `Target vertex "${target}" is not reachable from source vertex "${source}"`,
      };
    }

    const distances = new Map<VertexId, number>();
    const predecessors = new Map<VertexId, VertexId | null>();
    const visited = new Set<VertexId>();
    const edges = graph.getEdges();
    const isDirected = graph.getGraphType() === 'directed';

    for (const vertex of vertices) {
      distances.set(vertex, vertex === source ? 0 : Infinity);
      predecessors.set(vertex, null);
    }

    const adjacencyList = new Map<
      VertexId,
      Array<{ target: VertexId; weight: Weight }>
    >();
    for (const edge of edges) {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList
        .get(edge.source)!
        .push({ target: edge.target, weight: isWeighted ? edge.weight : 1 });

      if (!isDirected) {
        if (!adjacencyList.has(edge.target)) {
          adjacencyList.set(edge.target, []);
        }
        adjacencyList
          .get(edge.target)!
          .push({ target: edge.source, weight: isWeighted ? edge.weight : 1 });
      }
    }

    const pq = new PriorityQueue<{ node: VertexId; distance: number }>();

    pq.enqueue({ node: source, distance: 0 }, 0);

    while (!pq.isEmpty()) {
      const current = pq.dequeue()!;
      const currentNode = current.node;
      const currentDistance = current.distance;

      if (
        visited.has(currentNode) ||
        currentDistance > distances.get(currentNode)!
      ) {
        continue;
      }

      visited.add(currentNode);

      if (currentNode === target) {
        break;
      }

      const neighbors = adjacencyList.get(currentNode) || [];
      for (const { target: neighbor, weight } of neighbors) {
        if (visited.has(neighbor)) {
          continue;
        }

        const newDistance = currentDistance + weight;
        const currentNeighborDistance = distances.get(neighbor)!;

        if (newDistance < currentNeighborDistance) {
          distances.set(neighbor, newDistance);
          predecessors.set(neighbor, currentNode);
          pq.enqueue({ node: neighbor, distance: newDistance }, newDistance);
        }
      }
    }

    const path = this.reconstructPath(predecessors, source, target);
    const totalDistance = distances.get(target)!;

    return {
      distances,
      predecessors,
      path,
      totalDistance,
    };
  }

  static bellmanFord(
    graph: GraphAPI,
    source: VertexId,
    target: VertexId,
    isWeighted: boolean = true
  ): ShortestPathResult | ShortestPathError {
    const validationError = this.validateGraph(graph, 'bellman-ford');
    if (validationError && validationError.type !== 'negative_weights') {
      return validationError;
    }

    const vertices = graph.getVertices();

    if (!vertices.includes(source)) {
      return {
        type: 'validation',
        message: `Source vertex "${source}" does not exist in the graph`,
      };
    }

    if (!vertices.includes(target)) {
      return {
        type: 'validation',
        message: `Target vertex "${target}" does not exist in the graph`,
      };
    }

    if (source === target) {
      return {
        distances: new Map([[source, 0]]),
        predecessors: new Map([[source, null]]),
        path: [source],
        totalDistance: 0,
        hasNegativeCycle: false,
      };
    }

    if (!this.isReachable(graph, source, target)) {
      return {
        type: 'unreachable',
        message: `Target vertex "${target}" is not reachable from source vertex "${source}"`,
      };
    }

    const distances = new Map<VertexId, number>();
    const predecessors = new Map<VertexId, VertexId | null>();
    const edges = graph.getEdges();
    const isDirected = graph.getGraphType() === 'directed';

    for (const vertex of vertices) {
      distances.set(vertex, vertex === source ? 0 : Infinity);
      predecessors.set(vertex, null);
    }

    const edgeList = [...edges];
    if (!isDirected) {
      for (const edge of edges) {
        edgeList.push({
          source: edge.target,
          target: edge.source,
          weight: isWeighted ? edge.weight : 1,
          id: `${edge.id}_reverse`,
        });
      }
    }

    const nodeCount = vertices.length;

    for (let i = 0; i < nodeCount - 1; i++) {
      let hasUpdate = false;

      for (const edge of edgeList) {
        const { source: u, target: v } = edge;
        const weight = isWeighted ? edge.weight : 1;
        const distanceU = distances.get(u)!;
        const distanceV = distances.get(v)!;

        if (distanceU !== Infinity && distanceU + weight < distanceV) {
          distances.set(v, distanceU + weight);
          predecessors.set(v, u);
          hasUpdate = true;
        }
      }

      if (!hasUpdate) {
        break;
      }
    }

    for (const edge of edgeList) {
      const { source: u, target: v } = edge;
      const weight = isWeighted ? edge.weight : 1;
      const distanceU = distances.get(u)!;
      const distanceV = distances.get(v)!;

      if (distanceU !== Infinity && distanceU + weight < distanceV) {
        return {
          type: 'negative_cycle',
          message:
            'Graph contains a negative-weight cycle reachable from the source',
        };
      }
    }

    const path = this.reconstructPath(predecessors, source, target);
    const totalDistance = distances.get(target)!;

    return {
      distances,
      predecessors,
      path,
      totalDistance,
      hasNegativeCycle: false,
    };
  }

  static computeShortestPath(
    graph: GraphAPI,
    source: VertexId,
    target: VertexId,
    algorithm: ShortestPathAlgorithm = 'dijkstra',
    isWeighted: boolean = true
  ): ShortestPathResult | ShortestPathError {
    switch (algorithm) {
      case 'dijkstra':
        return this.dijkstra(graph, source, target, isWeighted);
      case 'bellman-ford':
        return this.bellmanFord(graph, source, target, isWeighted);
      default:
        return {
          type: 'validation',
          message: `Unknown algorithm: ${algorithm}`,
        };
    }
  }
}
