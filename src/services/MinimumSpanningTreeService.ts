import type { VertexId, EdgeId, Weight } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';
import { UnionFind } from '../utils/UnionFind';
import { PriorityQueue } from '../utils/PriorityQueue';
import { isGraphConnected } from '../utils/GraphConnectivity';

export interface MSTEdge {
  id: EdgeId;
  source: VertexId;
  target: VertexId;
  weight: Weight;
}

export interface MSTResult {
  edges: MSTEdge[];
  totalWeight: number;
  algorithm: 'kruskal' | 'prim';
}

export interface MSTError {
  type:
    | 'not_connected'
    | 'not_weighted'
    | 'insufficient_vertices'
    | 'directed_graph';
  message: string;
}

export type MSTResponse =
  | { success: true; result: MSTResult }
  | { success: false; error: MSTError };

function validateGraph(graph: GraphAPI): MSTError | null {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();
  const graphType = graph.getGraphType();

  if (graphType === 'directed') {
    return {
      type: 'directed_graph',
      message: 'MST can only be computed for undirected graphs',
    };
  }

  if (vertices.length < 2) {
    return {
      type: 'insufficient_vertices',
      message: 'MST requires at least 2 vertices',
    };
  }

  const hasUnweightedEdges = edges.some(
    (edge) => edge.weight === undefined || edge.weight === null
  );
  if (hasUnweightedEdges) {
    return {
      type: 'not_weighted',
      message: 'MST requires all edges to have weights',
    };
  }

  return null;
}

function validateAndCheckConnectivity(graph: GraphAPI): MSTError | null {
  const validationError = validateGraph(graph);
  if (validationError) {
    return validationError;
  }

  if (!isGraphConnected(graph)) {
    return {
      type: 'not_connected',
      message: 'Graph must be connected to compute MST',
    };
  }

  return null;
}

/**
 * Kruskal's algorithm for finding MST
 * Time complexity: O(E log E)
 * Space complexity: O(V)
 */
export function kruskalMST(graph: GraphAPI): MSTResponse {
  const validationError = validateAndCheckConnectivity(graph);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  const unionFind = new UnionFind<VertexId>(vertices);
  const mstEdges: MSTEdge[] = [];
  let totalWeight = 0;

  for (const edge of sortedEdges) {
    if (unionFind.union(edge.source, edge.target)) {
      mstEdges.push(edge);
      totalWeight += edge.weight;

      if (mstEdges.length === vertices.length - 1) {
        break;
      }
    }
  }

  return {
    success: true,
    result: {
      edges: mstEdges,
      totalWeight,
      algorithm: 'kruskal',
    },
  };
}

/**
 * Prim's algorithm for finding MST
 * Time complexity: O(E log V)
 * Space complexity: O(V + E)
 */
export function primMST(graph: GraphAPI, startVertex?: VertexId): MSTResponse {
  const validationError = validateAndCheckConnectivity(graph);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  const start = startVertex || vertices[0];

  const adjacencyList = new Map<
    VertexId,
    Array<{ vertex: VertexId; weight: Weight; edgeId: EdgeId }>
  >();
  for (const vertex of vertices) {
    adjacencyList.set(vertex, []);
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push({
      vertex: edge.target,
      weight: edge.weight,
      edgeId: edge.id,
    });
    adjacencyList.get(edge.target)?.push({
      vertex: edge.source,
      weight: edge.weight,
      edgeId: edge.id,
    });
  }

  const visited = new Set<VertexId>();
  const priorityQueue = new PriorityQueue<{
    vertex: VertexId;
    weight: Weight;
    edgeId: EdgeId;
    from: VertexId;
  }>();
  const mstEdges: MSTEdge[] = [];
  let totalWeight = 0;

  visited.add(start);

  const startNeighbors = adjacencyList.get(start) || [];
  for (const neighbor of startNeighbors) {
    priorityQueue.enqueue(
      {
        vertex: neighbor.vertex,
        weight: neighbor.weight,
        edgeId: neighbor.edgeId,
        from: start,
      },
      neighbor.weight
    );
  }

  while (!priorityQueue.isEmpty() && mstEdges.length < vertices.length - 1) {
    const current = priorityQueue.dequeue();
    if (!current || visited.has(current.vertex)) {
      continue;
    }

    visited.add(current.vertex);
    mstEdges.push({
      id: current.edgeId,
      source: current.from,
      target: current.vertex,
      weight: current.weight,
    });
    totalWeight += current.weight;

    const neighbors = adjacencyList.get(current.vertex) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        priorityQueue.enqueue(
          {
            vertex: neighbor.vertex,
            weight: neighbor.weight,
            edgeId: neighbor.edgeId,
            from: current.vertex,
          },
          neighbor.weight
        );
      }
    }
  }

  return {
    success: true,
    result: {
      edges: mstEdges,
      totalWeight,
      algorithm: 'prim',
    },
  };
}

export function computeMST(
  graph: GraphAPI,
  algorithm: 'kruskal' | 'prim' = 'kruskal',
  startVertex?: VertexId
): MSTResponse {
  if (algorithm === 'prim' && startVertex) {
    const vertices = graph.getVertices();
    if (!vertices.includes(startVertex)) {
      return {
        success: false,
        error: {
          type: 'insufficient_vertices',
          message: `Starting vertex '${startVertex}' not found in graph`,
        },
      };
    }
  }

  return algorithm === 'kruskal'
    ? kruskalMST(graph)
    : primMST(graph, startVertex);
}
