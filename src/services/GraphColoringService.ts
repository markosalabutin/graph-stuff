import type { VertexId } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';
import { GraphUtils } from '../utils/GraphUtils';

export interface ColoringResult {
  coloring: Map<VertexId, number>;
  numColors: number;
  colorClasses: VertexId[][];
}

export class GraphColoringService {
  /**
   * Colors the graph using the DSatur algorithm (Degree of Saturation).
   * DSatur is a greedy algorithm that selects vertices based on saturation degree
   * (number of different colors used by adjacent vertices).
   */
  static colorGraph(graph: GraphAPI): ColoringResult {
    const vertices = graph.getVertices();
    
    if (vertices.length === 0) {
      return {
        coloring: new Map(),
        numColors: 0,
        colorClasses: []
      };
    }

    const coloring = new Map<VertexId, number>();
    const saturation = new Map<VertexId, number>();
    const adjacentColors = new Map<VertexId, Set<number>>();
    const vertexDegrees = GraphUtils.calculateVertexDegrees(graph);
    
    for (const vertex of vertices) {
      saturation.set(vertex, 0);
      adjacentColors.set(vertex, new Set());
    }

    const uncolored = new Set(vertices);
    
    while (uncolored.size > 0) {
      // Select vertex with highest saturation degree
      // Break ties by selecting vertex with highest degree
      const selectedVertex = this.selectNextVertex(uncolored, saturation, vertexDegrees);
      
      // Find the smallest available color
      const color = this.getSmallestAvailableColor(adjacentColors.get(selectedVertex)!);
      
      // Color the vertex
      coloring.set(selectedVertex, color);
      uncolored.delete(selectedVertex);
      
      // Update saturation of adjacent uncolored vertices
      this.updateAdjacentSaturation(
        graph,
        selectedVertex,
        color,
        uncolored,
        saturation,
        adjacentColors
      );
    }

    // Group vertices by color
    const colorClasses = this.groupVerticesByColor(coloring);
    
    return {
      coloring,
      numColors: colorClasses.length,
      colorClasses
    };
  }

  /**
   * Select the next vertex to color based on DSatur heuristic:
   * 1. Highest saturation degree (number of different colors used by neighbors)
   * 2. Break ties by highest degree
   * 3. Break remaining ties by vertex ID (for deterministic behavior)
   */
  private static selectNextVertex(
    uncolored: Set<VertexId>,
    saturation: Map<VertexId, number>,
    vertexDegrees: Map<VertexId, number>
  ): VertexId {
    let bestVertex = '';
    let bestSaturation = -1;
    let bestDegree = -1;

    for (const vertex of uncolored) {
      const sat = saturation.get(vertex)!;
      const deg = vertexDegrees.get(vertex)!;
      
      if (sat > bestSaturation || 
          (sat === bestSaturation && deg > bestDegree) ||
          (sat === bestSaturation && deg === bestDegree && vertex < bestVertex)) {
        bestVertex = vertex;
        bestSaturation = sat;
        bestDegree = deg;
      }
    }

    return bestVertex;
  }

  private static getSmallestAvailableColor(adjacentColors: Set<number>): number {
    let color = 0;
    while (adjacentColors.has(color)) {
      color++;
    }
    return color;
  }

  /**
   * Update saturation of vertices adjacent to the newly colored vertex
   */
  private static updateAdjacentSaturation(
    graph: GraphAPI,
    coloredVertex: VertexId,
    color: number,
    uncolored: Set<VertexId>,
    saturation: Map<VertexId, number>,
    adjacentColors: Map<VertexId, Set<number>>
  ): void {
    const adjacentVertices = this.getAdjacentVertices(graph, coloredVertex);
    
    for (const adjacentVertex of adjacentVertices) {
      if (uncolored.has(adjacentVertex)) {
        const colors = adjacentColors.get(adjacentVertex)!;
        if (!colors.has(color)) {
          colors.add(color);
          saturation.set(adjacentVertex, colors.size);
        }
      }
    }
  }

  private static getAdjacentVertices(graph: GraphAPI, vertexId: VertexId): VertexId[] {
    const edges = graph.getEdges();
    const adjacent: VertexId[] = [];
    
    for (const edge of edges) {
      // Skip self-loops
      if (edge.source === edge.target) {
        continue;
      }
      
      if (edge.source === vertexId) {
        adjacent.push(edge.target);
      } else if (edge.target === vertexId) {
        adjacent.push(edge.source);
      }
    }
    
    return adjacent;
  }

  private static groupVerticesByColor(coloring: Map<VertexId, number>): VertexId[][] {
    const colorClasses: VertexId[][] = [];
    
    for (const [vertex, color] of coloring) {
      if (!colorClasses[color]) {
        colorClasses[color] = [];
      }
      colorClasses[color].push(vertex);
    }
    
    // Sort vertices within each color class for deterministic output
    colorClasses.forEach(colorClass => colorClass.sort());
    
    return colorClasses;
  }

  /**
   * Validate that a coloring is proper (no adjacent vertices have the same color)
   */
  static validateColoring(graph: GraphAPI, coloring: Map<VertexId, number>): boolean {
    const edges = graph.getEdges();
    
    for (const edge of edges) {
      // Skip self-loops - a vertex can have the same color as itself
      if (edge.source === edge.target) {
        continue;
      }
      
      const fromColor = coloring.get(edge.source);
      const toColor = coloring.get(edge.target);
      
      if (fromColor !== undefined && toColor !== undefined && fromColor === toColor) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get the chromatic number lower bound based on clique size and vertex count/independence number
   */
  static getColoringBounds(graph: GraphAPI): { lowerBound: number; upperBound: number } {
    const vertices = graph.getVertices();
    
    if (vertices.length === 0) {
      return { lowerBound: 0, upperBound: 0 };
    }

    // Lower bound: size of maximum clique (approximated by greedy approach)
    const cliqueLowerBound = this.findMaxCliqueLowerBound(graph);
    
    // Upper bound: DSatur typically gives good results, but theoretical upper bound is degree + 1
    const vertexDegrees = GraphUtils.calculateVertexDegrees(graph);
    const maxDegree = Math.max(...Array.from(vertexDegrees.values()));
    const upperBound = maxDegree + 1;
    
    return {
      lowerBound: Math.max(cliqueLowerBound, 1),
      upperBound
    };
  }

  /**
   * Find a lower bound for the chromatic number by finding a large clique
   */
  private static findMaxCliqueLowerBound(graph: GraphAPI): number {
    const vertices = graph.getVertices();
    
    // Simple greedy approach to find a reasonably large clique
    let maxCliqueSize = 1;
    
    for (const vertex of vertices) {
      const neighbors = this.getAdjacentVertices(graph, vertex);
      
      // Try to grow a clique starting from this vertex
      const clique = [vertex];
      
      for (const neighbor of neighbors) {
        // Check if neighbor is connected to all vertices in current clique
        const isConnectedToAll = clique.every(cliqueVertex => 
          cliqueVertex === neighbor || 
          this.areVerticesAdjacent(graph, neighbor, cliqueVertex)
        );
        
        if (isConnectedToAll) {
          clique.push(neighbor);
        }
      }
      
      maxCliqueSize = Math.max(maxCliqueSize, clique.length);
    }
    
    return maxCliqueSize;
  }

  /**
   * Check if two vertices are adjacent
   */
  private static areVerticesAdjacent(graph: GraphAPI, vertex1: VertexId, vertex2: VertexId): boolean {
    const edges = graph.getEdges();
    
    return edges.some(edge => 
      (edge.source === vertex1 && edge.target === vertex2) ||
      (edge.source === vertex2 && edge.target === vertex1)
    );
  }
}
