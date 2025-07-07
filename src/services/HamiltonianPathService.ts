import type { GraphAPI } from '../context/GraphContext';
import type { VertexId } from '../domain/Graph';
import { GraphUtils } from '../utils/GraphUtils';

export interface HamiltonianPathResult {
  hasHamiltonianPath: boolean;
  hasHamiltonianCycle: boolean;
  path?: VertexId[];
  startVertex?: VertexId;
  endVertex?: VertexId;
  reason?: string;
  searchStats?: {
    nodesExplored: number;
    backtrackCount: number;
    maxDepth: number;
  };
}

export interface HamiltonianAnalysis {
  vertexCount: number;
  edgeCount: number;
  minDegree: number;
  maxDegree: number;
  isConnected: boolean;
  vertexDegrees: Map<VertexId, number>;
}

/**
 * Service for finding Hamiltonian paths and cycles in graphs
 * 
 * A Hamiltonian path visits every vertex exactly once.
 * A Hamiltonian cycle is a Hamiltonian path that starts and ends at the same vertex.
 * 
 * Note: The Hamiltonian path problem is NP-complete, so this implementation uses
 * backtracking which may be slow for large graphs.
 */
export class HamiltonianPathService {
  private static readonly MAX_VERTICES_FOR_EXHAUSTIVE_SEARCH = 15;

  /**
   * Analyzes the graph for Hamiltonian properties
   */
  static analyzeGraph(graph: GraphAPI): HamiltonianAnalysis {
    const vertices = graph.getVertices();
    
    if (vertices.length === 0) {
      return {
        vertexCount: 0,
        edgeCount: 0,
        minDegree: 0,
        maxDegree: 0,
        isConnected: true,
        vertexDegrees: new Map(),
      };
    }

    // Use GraphUtils for common analysis
    const basicAnalysis = GraphUtils.analyzeGraph(graph);

    return {
      vertexCount: basicAnalysis.vertexCount,
      edgeCount: basicAnalysis.edgeCount,
      minDegree: basicAnalysis.minDegree,
      maxDegree: basicAnalysis.maxDegree,
      isConnected: basicAnalysis.isConnected,
      vertexDegrees: basicAnalysis.vertexDegrees,
    };
  }

  /**
   * Finds a Hamiltonian path or cycle in the graph
   */
  static findHamiltonianPath(graph: GraphAPI): HamiltonianPathResult {
    const analysis = this.analyzeGraph(graph);
    const vertices = graph.getVertices();

    if (vertices.length === 0) {
      return {
        hasHamiltonianPath: true,
        hasHamiltonianCycle: true,
        path: [],
        reason: 'Empty graph has trivial Hamiltonian path',
      };
    }

    if (vertices.length === 1) {
      return {
        hasHamiltonianPath: true,
        hasHamiltonianCycle: true,
        path: [vertices[0]],
        startVertex: vertices[0],
        endVertex: vertices[0],
        reason: 'Single vertex is trivial Hamiltonian path',
      };
    }

    // Quick checks using necessary conditions
    if (analysis.edgeCount === 0) {
      return {
        hasHamiltonianPath: false,
        hasHamiltonianCycle: false,
        reason: 'Graph has no edges',
      };
    }

    if (!analysis.isConnected) {
      return {
        hasHamiltonianPath: false,
        hasHamiltonianCycle: false,
        reason: 'Graph is not connected',
      };
    }

    // Dirac's theorem: If every vertex has degree ≥ n/2, then the graph has a Hamiltonian cycle
    if (analysis.minDegree >= vertices.length / 2) {
      // We still need to find the actual path
      const result = this.searchHamiltonianPath(graph);
      if (result.hasHamiltonianPath) {
        return {
          ...result,
          reason: "Graph satisfies Dirac's theorem (every vertex degree ≥ n/2)",
        };
      }
    }

    // Ore's theorem: If for every pair of non-adjacent vertices u,v: deg(u) + deg(v) ≥ n,
    // then the graph has a Hamiltonian cycle
    if (this.satisfiesOreTheorem(graph, analysis)) {
      const result = this.searchHamiltonianPath(graph);
      if (result.hasHamiltonianPath) {
        return {
          ...result,
          reason: "Graph satisfies Ore's theorem",
        };
      }
    }

    // For larger graphs, warn about computational complexity
    if (vertices.length > this.MAX_VERTICES_FOR_EXHAUSTIVE_SEARCH) {
      return {
        hasHamiltonianPath: false,
        hasHamiltonianCycle: false,
        reason: `Graph has ${vertices.length} vertices. Hamiltonian path search is limited to ${this.MAX_VERTICES_FOR_EXHAUSTIVE_SEARCH} vertices due to computational complexity.`,
      };
    }

    // Perform exhaustive search for smaller graphs
    return this.searchHamiltonianPath(graph);
  }

  /**
   * Performs backtracking search for Hamiltonian path
   */
  private static searchHamiltonianPath(graph: GraphAPI): HamiltonianPathResult {
    const vertices = graph.getVertices();
    
    // Use GraphUtils to build adjacency list
    const adjacencyList = GraphUtils.buildAdjacencyList(graph);

    let bestPath: VertexId[] | null = null;
    let hasHamiltonianCycle = false;
    const stats = {
      nodesExplored: 0,
      backtrackCount: 0,
      maxDepth: 0,
    };

    // Try starting from each vertex
    for (const startVertex of vertices) {
      const result = this.backtrackHamiltonian(
        startVertex,
        [startVertex],
        new Set([startVertex]),
        adjacencyList,
        vertices.length,
        stats
      );

      if (result) {
        bestPath = result.path;
        
        // Check if it's a cycle (can return to start)
        const lastVertex = result.path[result.path.length - 1];
        const neighbors = adjacencyList.get(lastVertex) || new Set();
        if (neighbors.has(startVertex) && result.path.length === vertices.length) {
          hasHamiltonianCycle = true;
          break; // Found a cycle, which is the best possible result
        }
        
        if (result.path.length === vertices.length) {
          break; // Found a complete path
        }
      }
    }

    if (bestPath) {
      return {
        hasHamiltonianPath: true,
        hasHamiltonianCycle,
        path: bestPath,
        startVertex: bestPath[0],
        endVertex: bestPath[bestPath.length - 1],
        searchStats: stats,
      };
    }

    return {
      hasHamiltonianPath: false,
      hasHamiltonianCycle: false,
      reason: 'No Hamiltonian path found after exhaustive search',
      searchStats: stats,
    };
  }

  /**
   * Backtracking algorithm to find Hamiltonian path
   */
  private static backtrackHamiltonian(
    currentVertex: VertexId,
    currentPath: VertexId[],
    visited: Set<VertexId>,
    adjacencyList: Map<VertexId, Set<VertexId>>,
    totalVertices: number,
    stats: { nodesExplored: number; backtrackCount: number; maxDepth: number }
  ): { path: VertexId[] } | null {
    stats.nodesExplored++;
    stats.maxDepth = Math.max(stats.maxDepth, currentPath.length);

    // If we've visited all vertices, we found a Hamiltonian path
    if (currentPath.length === totalVertices) {
      return { path: [...currentPath] };
    }

    const neighbors = adjacencyList.get(currentVertex) || new Set();
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // Add neighbor to path
        currentPath.push(neighbor);
        visited.add(neighbor);

        // Recurse
        const result = this.backtrackHamiltonian(
          neighbor,
          currentPath,
          visited,
          adjacencyList,
          totalVertices,
          stats
        );

        if (result) {
          return result;
        }

        // Backtrack
        currentPath.pop();
        visited.delete(neighbor);
        stats.backtrackCount++;
      }
    }

    return null;
  }

  /**
   * Checks if the graph satisfies Ore's theorem
   */
  private static satisfiesOreTheorem(graph: GraphAPI, analysis: HamiltonianAnalysis): boolean {
    const vertices = graph.getVertices();
    const n = vertices.length;

    if (n < 3) return false;

    // Use GraphUtils to build adjacency list
    const adjacencyList = GraphUtils.buildAdjacencyList(graph);

    // Check all pairs of non-adjacent vertices
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const u = vertices[i];
        const v = vertices[j];
        
        // If vertices are not adjacent
        const uNeighbors = adjacencyList.get(u) || new Set();
        if (!uNeighbors.has(v)) {
          const degU = analysis.vertexDegrees.get(u) || 0;
          const degV = analysis.vertexDegrees.get(v) || 0;
          
          if (degU + degV < n) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Checks if the graph is connected
   */
  private static isGraphConnected(graph: GraphAPI): boolean {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    if (vertices.length <= 1) return true;
    if (edges.length === 0) return false;

    // Build adjacency list
    const adjacencyList = new Map<VertexId, Set<VertexId>>();
    vertices.forEach(vertex => adjacencyList.set(vertex, new Set()));

    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.add(edge.target);
      if (graph.getGraphType() === 'undirected') {
        adjacencyList.get(edge.target)?.add(edge.source);
      }
    });

    // DFS to check connectivity
    const visited = new Set<VertexId>();
    const stack = [vertices[0]];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      const neighbors = adjacencyList.get(current) || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      });
    }

    return visited.size === vertices.length;
  }
}
