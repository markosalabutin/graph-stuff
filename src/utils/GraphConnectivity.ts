import type { VertexId } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';

/**
 * Checks if an undirected graph is connected using Depth-First Search (DFS).
 * 
 * A graph is connected if there is a path between every pair of vertices.
 * This function assumes the graph is undirected and treats all edges as bidirectional.
 * 
 * Time complexity: O(V + E) where V is vertices and E is edges
 * Space complexity: O(V) for the visited set and call stack
 * 
 * @param graph - The graph to check for connectivity
 * @returns true if the graph is connected, false otherwise
 */
export function isGraphConnected(graph: GraphAPI): boolean {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  if (vertices.length === 0) return true;
  if (vertices.length === 1) return true;

  const adjacencyList = new Map<VertexId, Set<VertexId>>();
  for (const vertex of vertices) {
    adjacencyList.set(vertex, new Set());
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  }

  const visited = new Set<VertexId>();
  const stack = [vertices[0]];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;

    visited.add(current);
    const neighbors = adjacencyList.get(current) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return visited.size === vertices.length;
}

/**
 * Checks if a directed graph is strongly connected.
 * 
 * A directed graph is strongly connected if there is a directed path 
 * from every vertex to every other vertex.
 * 
 * Uses Kosaraju's algorithm with two DFS passes.
 * 
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 * 
 * @param graph - The directed graph to check
 * @returns true if the graph is strongly connected, false otherwise
 */
export function isDirectedGraphStronglyConnected(graph: GraphAPI): boolean {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  if (vertices.length <= 1) return true;

  const adjacencyList = new Map<VertexId, Set<VertexId>>();
  const reverseAdjacencyList = new Map<VertexId, Set<VertexId>>();
  
  for (const vertex of vertices) {
    adjacencyList.set(vertex, new Set());
    reverseAdjacencyList.set(vertex, new Set());
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.add(edge.target);
    reverseAdjacencyList.get(edge.target)?.add(edge.source);
  }

  const visited1 = new Set<VertexId>();
  const stack1 = [vertices[0]];

  while (stack1.length > 0) {
    const current = stack1.pop()!;
    if (visited1.has(current)) continue;

    visited1.add(current);
    const neighbors = adjacencyList.get(current) || new Set();

    for (const neighbor of neighbors) {
      if (!visited1.has(neighbor)) {
        stack1.push(neighbor);
      }
    }
  }

  if (visited1.size !== vertices.length) return false;

  const visited2 = new Set<VertexId>();
  const stack2 = [vertices[0]];

  while (stack2.length > 0) {
    const current = stack2.pop()!;
    if (visited2.has(current)) continue;

    visited2.add(current);
    const neighbors = reverseAdjacencyList.get(current) || new Set();

    for (const neighbor of neighbors) {
      if (!visited2.has(neighbor)) {
        stack2.push(neighbor);
      }
    }
  }

  return visited2.size === vertices.length;
}
