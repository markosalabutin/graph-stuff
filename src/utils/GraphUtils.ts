import type { GraphAPI } from '../context/GraphContext';
import type { VertexId, EdgeId } from '../domain/Graph';
import { isGraphConnected, isDirectedGraphStronglyConnected } from './GraphConnectivity';

export class GraphUtils {
  static buildAdjacencyList(graph: GraphAPI): Map<VertexId, Set<VertexId>> {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const adjacencyList = new Map<VertexId, Set<VertexId>>();

    vertices.forEach(vertex => adjacencyList.set(vertex, new Set()));

    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.add(edge.target);
      if (graph.getGraphType() === 'undirected') {
        adjacencyList.get(edge.target)?.add(edge.source);
      }
    });

    return adjacencyList;
  }

  static buildAdjacencyListWithEdges(graph: GraphAPI): Map<VertexId, Array<{ vertex: VertexId; edgeId: EdgeId }>> {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const adjacencyList = new Map<VertexId, Array<{ vertex: VertexId; edgeId: EdgeId }>>();

    vertices.forEach(vertex => adjacencyList.set(vertex, []));

    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push({ vertex: edge.target, edgeId: edge.id });
      if (graph.getGraphType() === 'undirected') {
        adjacencyList.get(edge.target)?.push({ vertex: edge.source, edgeId: edge.id });
      }
    });

    return adjacencyList;
  }

  static calculateVertexDegrees(graph: GraphAPI): Map<VertexId, number> {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const vertexDegrees = new Map<VertexId, number>();

    vertices.forEach(vertex => vertexDegrees.set(vertex, 0));

    edges.forEach(edge => {
      const sourceDegree = vertexDegrees.get(edge.source) || 0;
      vertexDegrees.set(edge.source, sourceDegree + 1);
      
      if (graph.getGraphType() === 'undirected' && edge.source !== edge.target) {
        const targetDegree = vertexDegrees.get(edge.target) || 0;
        vertexDegrees.set(edge.target, targetDegree + 1);
      }
    });

    return vertexDegrees;
  }

  static calculateDirectedDegrees(graph: GraphAPI): { 
    inDegrees: Map<VertexId, number>; 
    outDegrees: Map<VertexId, number> 
  } {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const inDegrees = new Map<VertexId, number>();
    const outDegrees = new Map<VertexId, number>();

    vertices.forEach(vertex => {
      inDegrees.set(vertex, 0);
      outDegrees.set(vertex, 0);
    });

    edges.forEach(edge => {
      const outDegree = outDegrees.get(edge.source) || 0;
      const inDegree = inDegrees.get(edge.target) || 0;
      outDegrees.set(edge.source, outDegree + 1);
      inDegrees.set(edge.target, inDegree + 1);
    });

    return { inDegrees, outDegrees };
  }

  static isConnected(graph: GraphAPI): boolean {
    if (graph.getGraphType() === 'directed') {
      return isDirectedGraphStronglyConnected(graph);
    }
    return isGraphConnected(graph);
  }

  static getVerticesWithEdges(graph: GraphAPI): Set<VertexId> {
    const edges = graph.getEdges();
    const verticesWithEdges = new Set<VertexId>();

    edges.forEach(edge => {
      verticesWithEdges.add(edge.source);
      verticesWithEdges.add(edge.target);
    });

    return verticesWithEdges;
  }

  static isConnectedConsideringOnlyVerticesWithEdges(graph: GraphAPI): boolean {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    if (vertices.length <= 1) return true;
    if (edges.length === 0) return vertices.length <= 1;

    const verticesWithEdges = this.getVerticesWithEdges(graph);
    if (verticesWithEdges.size <= 1) return true;

    // For directed graphs, we check if there's a path from every vertex to every other vertex
    // For undirected graphs, we check if all vertices with edges are in one connected component
    if (graph.getGraphType() === 'directed') {
      // For directed graphs, check if every vertex can reach every other vertex
      const adjacencyList = new Map<VertexId, Set<VertexId>>();
      verticesWithEdges.forEach(vertex => adjacencyList.set(vertex, new Set()));

      edges.forEach(edge => {
        adjacencyList.get(edge.source)?.add(edge.target);
      });

      // Check if every vertex can reach every other vertex
      for (const startVertex of verticesWithEdges) {
        const visited = new Set<VertexId>();
        const stack = [startVertex];

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

        if (visited.size !== verticesWithEdges.size) {
          return false;
        }
      }
      return true;
    } else {
      // For undirected graphs, use the existing logic
      const adjacencyList = new Map<VertexId, Set<VertexId>>();
      verticesWithEdges.forEach(vertex => adjacencyList.set(vertex, new Set()));

      edges.forEach(edge => {
        adjacencyList.get(edge.source)?.add(edge.target);
        adjacencyList.get(edge.target)?.add(edge.source);
      });

      const visited = new Set<VertexId>();
      const startVertex = Array.from(verticesWithEdges)[0];
      const stack = [startVertex];

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

      return visited.size === verticesWithEdges.size;
    }
  }

  static analyzeGraph(graph: GraphAPI) {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const vertexDegrees = this.calculateVertexDegrees(graph);
    const isConnected = this.isConnected(graph);
    
    const degrees = Array.from(vertexDegrees.values());
    const minDegree = degrees.length > 0 ? Math.min(...degrees) : 0;
    const maxDegree = degrees.length > 0 ? Math.max(...degrees) : 0;

    return {
      vertexCount: vertices.length,
      edgeCount: edges.length,
      vertexDegrees,
      minDegree,
      maxDegree,
      isConnected,
      vertices,
      edges,
    };
  }

  static separateVerticesByDegree(vertexDegrees: Map<VertexId, number>) {
    const oddDegreeVertices: VertexId[] = [];
    const evenDegreeVertices: VertexId[] = [];

    vertexDegrees.forEach((degree, vertex) => {
      if (degree % 2 === 0) {
        evenDegreeVertices.push(vertex);
      } else {
        oddDegreeVertices.push(vertex);
      }
    });

    return { oddDegreeVertices, evenDegreeVertices };
  }

  static buildWeightedAdjacencyList(
    graph: GraphAPI, 
    isWeighted: boolean = true
  ): Map<VertexId, Array<{ target: VertexId; weight: number }>> {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const adjacencyList = new Map<VertexId, Array<{ target: VertexId; weight: number }>>();

    vertices.forEach(vertex => adjacencyList.set(vertex, []));

    edges.forEach(edge => {
      const weight = isWeighted ? edge.weight : 1;
      adjacencyList.get(edge.source)?.push({ target: edge.target, weight });
      
      if (graph.getGraphType() === 'undirected') {
        adjacencyList.get(edge.target)?.push({ target: edge.source, weight });
      }
    });

    return adjacencyList;
  }

  static buildWeightedAdjacencyListWithEdges(
    graph: GraphAPI
  ): Map<VertexId, Array<{ vertex: VertexId; weight: number; edgeId: EdgeId }>> {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();
    const adjacencyList = new Map<VertexId, Array<{ vertex: VertexId; weight: number; edgeId: EdgeId }>>();

    vertices.forEach(vertex => adjacencyList.set(vertex, []));

    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push({ 
        vertex: edge.target, 
        weight: edge.weight, 
        edgeId: edge.id 
      });
      
      if (graph.getGraphType() === 'undirected') {
        adjacencyList.get(edge.target)?.push({ 
          vertex: edge.source, 
          weight: edge.weight, 
          edgeId: edge.id 
        });
      }
    });

    return adjacencyList;
  }
}
