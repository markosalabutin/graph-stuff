import type { GraphAPI } from '../context/GraphContext';
import type { VertexId, EdgeId, Weight } from '../domain/Graph';
import type { GraphType } from '../domain/GraphModel';
import { GraphUtils } from '../utils/GraphUtils';

export interface EulerianPathResult {
  hasEulerianPath: boolean;
  hasEulerianCycle: boolean;
  path?: VertexId[];
  startVertex?: VertexId;
  endVertex?: VertexId;
  reason?: string;
}

export interface EulerianAnalysis {
  oddDegreeVertices: VertexId[];
  evenDegreeVertices: VertexId[];
  vertexDegrees: Map<VertexId, number>;
  isConnected: boolean;
}

/**
 * Service for finding Eulerian paths and cycles in graphs
 * 
 * An Eulerian path visits every edge exactly once.
 * An Eulerian cycle is an Eulerian path that starts and ends at the same vertex.
 * 
 * Conditions:
 * - Eulerian cycle: All vertices have even degree and graph is connected
 * - Eulerian path: Exactly 0 or 2 vertices have odd degree and graph is connected
 */
export class EulerianPathService {
  /**
   * Analyzes the graph for Eulerian properties
   */
  static analyzeGraph(graph: GraphAPI): EulerianAnalysis {
    const vertices = graph.getVertices();
    
    if (vertices.length === 0) {
      return {
        oddDegreeVertices: [],
        evenDegreeVertices: [],
        vertexDegrees: new Map(),
        isConnected: true, // Empty graph is considered connected
      };
    }

    // Use GraphUtils for degree calculation
    let vertexDegrees: Map<VertexId, number>;
    
    if (graph.getGraphType() === 'directed') {
      // For directed graphs, we need to consider total degree (in + out)
      const { inDegrees, outDegrees } = GraphUtils.calculateDirectedDegrees(graph);
      vertexDegrees = new Map();
      
      vertices.forEach(vertex => {
        const totalDegree = (inDegrees.get(vertex) || 0) + (outDegrees.get(vertex) || 0);
        vertexDegrees.set(vertex, totalDegree);
      });
    } else {
      // For undirected graphs, use the standard degree calculation
      vertexDegrees = GraphUtils.calculateVertexDegrees(graph);
    }
    
    // Separate odd and even degree vertices
    const { oddDegreeVertices, evenDegreeVertices } = GraphUtils.separateVerticesByDegree(vertexDegrees);

    // Check connectivity
    const isConnected = GraphUtils.isConnected(graph);

    return {
      oddDegreeVertices,
      evenDegreeVertices,
      vertexDegrees,
      isConnected,
    };
  }

  /**
   * Finds an Eulerian path or cycle in the graph
   */
  static findEulerianPath(graph: GraphAPI): EulerianPathResult {
    const analysis = this.analyzeGraph(graph);
    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    if (vertices.length === 0) {
      return {
        hasEulerianPath: true,
        hasEulerianCycle: true,
        path: [],
        reason: 'Empty graph has trivial Eulerian path',
      };
    }

    if (edges.length === 0) {
      return {
        hasEulerianPath: vertices.length <= 1,
        hasEulerianCycle: vertices.length <= 1,
        path: vertices.length === 1 ? [vertices[0]] : [],
        reason: vertices.length > 1 ? 'Graph with vertices but no edges cannot have Eulerian path' : 'Single vertex is trivial Eulerian path',
      };
    }

    if (!analysis.isConnected) {
      return {
        hasEulerianPath: false,
        hasEulerianCycle: false,
        reason: 'Graph is not connected',
      };
    }

    const oddCount = analysis.oddDegreeVertices.length;

    if (oddCount === 0) {
      // Eulerian cycle exists
      const path = this.findEulerianCycle(graph);
      return {
        hasEulerianPath: true,
        hasEulerianCycle: true,
        path,
        startVertex: path?.[0],
        endVertex: path?.[path?.length - 1],
      };
    } else if (oddCount === 2) {
      // Eulerian path exists (but not cycle)
      const path = this.findEulerianPathBetweenOddVertices(graph, analysis);
      return {
        hasEulerianPath: true,
        hasEulerianCycle: false,
        path,
        startVertex: analysis.oddDegreeVertices[0],
        endVertex: analysis.oddDegreeVertices[1],
      };
    } else {
      return {
        hasEulerianPath: false,
        hasEulerianCycle: false,
        reason: `Graph has ${oddCount} vertices with odd degree. Need exactly 0 or 2 for Eulerian path.`,
      };
    }
  }

  /**
   * Finds an Eulerian cycle using Hierholzer's algorithm
   */
  private static findEulerianCycle(graph: GraphAPI): VertexId[] | undefined {
    const vertices = graph.getVertices();
    
    if (vertices.length === 0) return [];

    // Use GraphUtils to build adjacency list with edge tracking
    const adjacencyList = GraphUtils.buildAdjacencyListWithEdges(graph);
    const usedEdges = new Set<string>();

    // Start from any vertex with edges
    const startVertex = vertices.find(v => (adjacencyList.get(v)?.length || 0) > 0);
    if (!startVertex) return [];

    const circuit: VertexId[] = [];
    const stack: VertexId[] = [startVertex];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = adjacencyList.get(current) || [];
      
      // Find an unused edge
      const availableEdge = neighbors.find(({ edgeId }) => !usedEdges.has(edgeId));
      
      if (availableEdge) {
        // Traverse the edge
        usedEdges.add(availableEdge.edgeId);
        stack.push(availableEdge.vertex);
      } else {
        // No more edges from this vertex, add to circuit
        circuit.push(stack.pop()!);
      }
    }

    return circuit.reverse();
  }

  /**
   * Finds an Eulerian path between two odd-degree vertices
   */
  private static findEulerianPathBetweenOddVertices(graph: GraphAPI, analysis: EulerianAnalysis): VertexId[] | undefined {
    // Add a temporary edge between the two odd-degree vertices to create an Eulerian cycle
    const [start, end] = analysis.oddDegreeVertices;
    
    // Create a modified graph for the algorithm
    const modifiedEdges = [...graph.getEdges()];
    const tempEdgeId = 'temp-eulerian-edge';
    
    // Add temporary edge
    modifiedEdges.push({
      id: tempEdgeId,
      source: start,
      target: end,
      weight: 1,
    });

    // Create modified graph API
    const modifiedGraph: GraphAPI = {
      getVertices: () => graph.getVertices(),
      getEdges: () => modifiedEdges,
      getGraphType: () => graph.getGraphType(),
      addVertex: (id?: VertexId) => graph.addVertex(id),
      getVertex: (id: VertexId) => graph.getVertex(id),
      addEdge: (source: VertexId, target: VertexId, weight?: Weight) => graph.addEdge(source, target, weight),
      setEdgeWeight: (edgeId: EdgeId, weight: Weight) => graph.setEdgeWeight(edgeId, weight),
      removeVertex: (id: VertexId) => graph.removeVertex(id),
      removeEdge: (edgeId: EdgeId) => graph.removeEdge(edgeId),
      transitionGraphType: (targetType: GraphType) => graph.transitionGraphType(targetType),
    };

    // Find Eulerian cycle in modified graph
    const cycle = this.findEulerianCycle(modifiedGraph);
    
    if (!cycle) return undefined;

    // Remove the temporary edge from the path
    // Find where the temp edge appears and split the cycle there
    const startIndex = cycle.findIndex((vertex, i) => {
      if (i === cycle.length - 1) return false;
      const nextVertex = cycle[i + 1];
      return (vertex === start && nextVertex === end) || (vertex === end && nextVertex === start);
    });

    if (startIndex === -1) return cycle;

    // Split the cycle to create a path from start to end
    const path = [...cycle.slice(startIndex + 1), ...cycle.slice(0, startIndex + 1)];
    return path;
  }
}
