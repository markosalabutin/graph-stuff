import type { VertexId } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';
import { ShortestPathService } from './ShortestPathService';

export type AllPairsAlgorithm = 'floyd-warshall' | 'johnson';

export interface AllPairsResult {
  distances: Map<VertexId, Map<VertexId, number>>;
  predecessors: Map<VertexId, Map<VertexId, VertexId | null>>;
  algorithm: AllPairsAlgorithm;
  hasNegativeCycle?: boolean;
}

export interface AllPairsError {
  type: 'validation' | 'negative_cycle' | 'negative_weights';
  message: string;
}

export class AllPairsShortestPathService {
  private static validateGraph(graph: GraphAPI): AllPairsError | null {
    const vertices = graph.getVertices();

    if (vertices.length < 2) {
      return {
        type: 'validation',
        message:
          'All-pairs shortest path computation requires at least 2 vertices',
      };
    }

    // Johnson's algorithm can handle negative weights but not negative cycles
    // Floyd-Warshall can handle negative weights but not negative cycles
    return null;
  }

  /**
   * Floyd-Warshall algorithm for all-pairs shortest paths
   * Time complexity: O(V³)
   * Space complexity: O(V²)
   * Works with negative edge weights but not negative cycles
   */
  static floydWarshall(
    graph: GraphAPI,
    isWeighted: boolean = true
  ): AllPairsResult | AllPairsError {
    const validationError = this.validateGraph(graph);
    if (validationError) {
      return validationError;
    }

    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    // Initialize distance and predecessor matrices
    const distances = new Map<VertexId, Map<VertexId, number>>();
    const predecessors = new Map<VertexId, Map<VertexId, VertexId | null>>();

    // Initialize all distances to infinity and predecessors to null
    for (const i of vertices) {
      distances.set(i, new Map());
      predecessors.set(i, new Map());
      for (const j of vertices) {
        distances.get(i)!.set(j, i === j ? 0 : Infinity);
        predecessors.get(i)!.set(j, null);
      }
    }

    // Set direct edge weights
    for (const edge of edges) {
      const weight = isWeighted ? edge.weight : 1;
      distances.get(edge.source)!.set(edge.target, weight);
      predecessors.get(edge.source)!.set(edge.target, edge.source);

      // For undirected graphs, add reverse edge
      if (graph.getGraphType() === 'undirected') {
        distances.get(edge.target)!.set(edge.source, weight);
        predecessors.get(edge.target)!.set(edge.source, edge.target);
      }
    }

    // Floyd-Warshall main algorithm
    for (const k of vertices) {
      for (const i of vertices) {
        for (const j of vertices) {
          const distIK = distances.get(i)!.get(k)!;
          const distKJ = distances.get(k)!.get(j)!;
          const distIJ = distances.get(i)!.get(j)!;

          if (
            distIK !== Infinity &&
            distKJ !== Infinity &&
            distIK + distKJ < distIJ
          ) {
            distances.get(i)!.set(j, distIK + distKJ);
            predecessors.get(i)!.set(j, predecessors.get(k)!.get(j) || null);
          }
        }
      }
    }

    // Check for negative cycles
    for (const i of vertices) {
      if (distances.get(i)!.get(i)! < 0) {
        return {
          type: 'negative_cycle',
          message: 'Graph contains a negative-weight cycle',
        };
      }
    }

    return {
      distances,
      predecessors,
      algorithm: 'floyd-warshall',
      hasNegativeCycle: false,
    };
  }

  /**
   * Johnson's algorithm for all-pairs shortest paths
   * Time complexity: O(V² log V + VE)
   * Space complexity: O(V²)
   * More efficient than Floyd-Warshall for sparse graphs
   * Uses Bellman-Ford + Dijkstra with reweighting
   */
  static johnson(
    graph: GraphAPI,
    isWeighted: boolean = true
  ): AllPairsResult | AllPairsError {
    const validationError = this.validateGraph(graph);
    if (validationError) {
      return validationError;
    }

    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    // Step 1: Add a new vertex connected to all vertices with weight 0
    const newVertex = '__johnson_temp__';
    const extendedVertices = [...vertices, newVertex];
    const extendedEdges = [
      ...edges.map((edge) => ({
        ...edge,
        weight: isWeighted ? edge.weight : 1,
      })),
      ...vertices.map((v) => ({
        id: `__temp_${v}__`,
        source: newVertex,
        target: v,
        weight: 0,
      })),
    ];

    // Step 2: Run Bellman-Ford from the new vertex
    const bellmanFordResult = this.bellmanFordForJohnson(
      extendedVertices,
      extendedEdges,
      newVertex,
      graph.getGraphType() === 'directed'
    );

    if ('type' in bellmanFordResult) {
      return bellmanFordResult;
    }

    const h = bellmanFordResult;

    // Step 3: Reweight edges using h values
    const reweightedEdges = edges.map((edge) => ({
      ...edge,
      weight:
        (isWeighted ? edge.weight : 1) +
        h.get(edge.source)! -
        h.get(edge.target)!,
    }));

    // Step 4: Run Dijkstra from each vertex on reweighted graph
    const distances = new Map<VertexId, Map<VertexId, number>>();
    const predecessors = new Map<VertexId, Map<VertexId, VertexId | null>>();

    for (const source of vertices) {
      const dijkstraResult = this.dijkstraForJohnson(
        vertices,
        reweightedEdges,
        source,
        graph.getGraphType() === 'directed'
      );

      const sourceDistances = new Map<VertexId, number>();
      const sourcePredecessors = new Map<VertexId, VertexId | null>();

      for (const target of vertices) {
        // Restore original distances
        const reweightedDist = dijkstraResult.distances.get(target)!;
        const originalDist = reweightedDist - h.get(source)! + h.get(target)!;

        sourceDistances.set(target, originalDist);
        sourcePredecessors.set(
          target,
          dijkstraResult.predecessors.get(target)!
        );
      }

      distances.set(source, sourceDistances);
      predecessors.set(source, sourcePredecessors);
    }

    return {
      distances,
      predecessors,
      algorithm: 'johnson',
      hasNegativeCycle: false,
    };
  }

  private static createMockGraph(
    vertices: VertexId[],
    edges: Array<{ source: VertexId; target: VertexId; weight: number }>,
    isDirected: boolean
  ): GraphAPI {
    return {
      getVertices: () => vertices,
      getEdges: () =>
        edges.map((edge) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
        })),
      getGraphType: () => (isDirected ? 'directed' : 'undirected'),
      // These methods are not used by the service but required by the interface
      // fug you interface segregation principle
      addVertex: () => {
        throw new Error('Not implemented');
      },
      getVertex: () => {
        throw new Error('Not implemented');
      },
      addEdge: () => {
        throw new Error('Not implemented');
      },
      setEdgeWeight: () => {
        throw new Error('Not implemented');
      },
      removeVertex: () => {
        throw new Error('Not implemented');
      },
      removeEdge: () => {
        throw new Error('Not implemented');
      },
      transitionGraphType: () => {
        throw new Error('Not implemented');
      },
      resetFromDTO: () => {
        throw new Error('Not implemented');
      },
    };
  }

  private static bellmanFordForJohnson(
    vertices: VertexId[],
    edges: Array<{ source: VertexId; target: VertexId; weight: number }>,
    source: VertexId,
    isDirected: boolean
  ): Map<VertexId, number> | AllPairsError {
    const mockGraph = this.createMockGraph(vertices, edges, isDirected);
    const distances = new Map<VertexId, number>();

    // For each vertex, run Bellman-Ford to get distance from source
    for (const target of vertices) {
      if (source === target) {
        distances.set(target, 0);
        continue;
      }

      const result = ShortestPathService.bellmanFord(
        mockGraph,
        source,
        target,
        true
      );

      if ('type' in result) {
        return result as AllPairsError;
      }

      distances.set(target, result.totalDistance);
    }

    return distances;
  }

  private static dijkstraForJohnson(
    vertices: VertexId[],
    edges: Array<{ source: VertexId; target: VertexId; weight: number }>,
    source: VertexId,
    isDirected: boolean
  ): {
    distances: Map<VertexId, number>;
    predecessors: Map<VertexId, VertexId | null>;
  } {
    const mockGraph = this.createMockGraph(vertices, edges, isDirected);
    const distances = new Map<VertexId, number>();
    const predecessors = new Map<VertexId, VertexId | null>();

    // For each target vertex, run Dijkstra to get distance and predecessor
    for (const target of vertices) {
      if (source === target) {
        distances.set(target, 0);
        predecessors.set(target, null);
        continue;
      }

      const result = ShortestPathService.dijkstra(
        mockGraph,
        source,
        target,
        true
      );

      if ('type' in result) {
        // If there's an error, set distance to infinity
        distances.set(target, Infinity);
        predecessors.set(target, null);
      } else {
        distances.set(target, result.totalDistance);
        // Get the predecessor of the target in the path
        const path = result.path;
        if (path.length > 1) {
          predecessors.set(target, path[path.length - 2]);
        } else {
          predecessors.set(target, null);
        }
      }
    }

    return { distances, predecessors };
  }

  /**
   * Helper method to reconstruct path between two vertices
   */
  static reconstructPath(
    predecessors: Map<VertexId, Map<VertexId, VertexId | null>>,
    source: VertexId,
    target: VertexId
  ): VertexId[] {
    const path: VertexId[] = [];
    let current: VertexId | null = target;
    const sourcePredecessors = predecessors.get(source);

    if (!sourcePredecessors) return [];

    while (current !== null) {
      path.unshift(current);
      if (current === source) break;
      current = sourcePredecessors.get(current) || null;

      // Prevent infinite loops
      if (path.length > predecessors.size * predecessors.size) {
        return [];
      }
    }

    return path.length > 0 && path[0] === source ? path : [];
  }

  /**
   * Compute all-pairs shortest paths using the specified algorithm
   */
  static computeAllPairsShortestPaths(
    graph: GraphAPI,
    algorithm: AllPairsAlgorithm = 'floyd-warshall',
    isWeighted: boolean = true
  ): AllPairsResult | AllPairsError {
    switch (algorithm) {
      case 'floyd-warshall':
        return this.floydWarshall(graph, isWeighted);
      case 'johnson':
        return this.johnson(graph, isWeighted);
      default:
        return {
          type: 'validation',
          message: `Unknown algorithm: ${algorithm}`,
        };
    }
  }
}
