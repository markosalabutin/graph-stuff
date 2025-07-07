import { describe, it, expect } from 'vitest';
import { GraphUtils } from '../GraphUtils';
import { createMockGraph } from '../../services/__tests__/testUtils';
import type { VertexId } from '../../domain/Graph';

describe('GraphUtils', () => {
  describe('buildAdjacencyList', () => {
    it('should build adjacency list for empty graph', () => {
      const graph = createMockGraph([], []);
      const result = GraphUtils.buildAdjacencyList(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should build adjacency list for undirected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 2 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.buildAdjacencyList(graph);
      
      expect(result.size).toBe(3);
      expect(result.get('A')).toEqual(new Set(['B']));
      expect(result.get('B')).toEqual(new Set(['A', 'C']));
      expect(result.get('C')).toEqual(new Set(['B']));
    });

    it('should build adjacency list for directed graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 2 }
        ],
        'directed'
      );
      
      const result = GraphUtils.buildAdjacencyList(graph);
      
      expect(result.size).toBe(3);
      expect(result.get('A')).toEqual(new Set(['B']));
      expect(result.get('B')).toEqual(new Set(['C']));
      expect(result.get('C')).toEqual(new Set([]));
    });

    it('should handle isolated vertices', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [{ source: 'A', target: 'B', weight: 1 }],
        'undirected'
      );
      
      const result = GraphUtils.buildAdjacencyList(graph);
      
      expect(result.size).toBe(3);
      expect(result.get('A')).toEqual(new Set(['B']));
      expect(result.get('B')).toEqual(new Set(['A']));
      expect(result.get('C')).toEqual(new Set([]));
    });
  });

  describe('buildAdjacencyListWithEdges', () => {
    it('should build adjacency list with edge IDs for undirected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'B', target: 'C', weight: 2 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.buildAdjacencyListWithEdges(graph);
      
      expect(result.size).toBe(3);
      expect(result.get('A')).toEqual([{ vertex: 'B', edgeId: 'e1' }]);
      expect(result.get('B')).toEqual([
        { vertex: 'A', edgeId: 'e1' },
        { vertex: 'C', edgeId: 'e2' }
      ]);
      expect(result.get('C')).toEqual([{ vertex: 'B', edgeId: 'e2' }]);
    });

    it('should build adjacency list with edge IDs for directed graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'B', target: 'C', weight: 2 }
        ],
        'directed'
      );
      
      const result = GraphUtils.buildAdjacencyListWithEdges(graph);
      
      expect(result.size).toBe(3);
      expect(result.get('A')).toEqual([{ vertex: 'B', edgeId: 'e1' }]);
      expect(result.get('B')).toEqual([{ vertex: 'C', edgeId: 'e2' }]);
      expect(result.get('C')).toEqual([]);
    });
  });

  describe('calculateVertexDegrees', () => {
    it('should calculate degrees for empty graph', () => {
      const graph = createMockGraph([], []);
      const result = GraphUtils.calculateVertexDegrees(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should calculate degrees for undirected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.calculateVertexDegrees(graph);
      
      expect(result.size).toBe(4);
      expect(result.get('A')).toBe(2);
      expect(result.get('B')).toBe(2);
      expect(result.get('C')).toBe(2);
      expect(result.get('D')).toBe(0); // isolated vertex
    });

    it('should calculate degrees for directed graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'directed'
      );
      
      const result = GraphUtils.calculateVertexDegrees(graph);
      
      expect(result.size).toBe(4);
      expect(result.get('A')).toBe(2); // out-degree only for directed
      expect(result.get('B')).toBe(1);
      expect(result.get('C')).toBe(0);
      expect(result.get('D')).toBe(0);
    });

    it('should handle self-loops correctly', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [
          { source: 'A', target: 'A', weight: 1 }, // self-loop
          { source: 'A', target: 'B', weight: 1 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.calculateVertexDegrees(graph);
      
      expect(result.get('A')).toBe(2); // self-loop + edge to B
      expect(result.get('B')).toBe(1);
    });
  });

  describe('calculateDirectedDegrees', () => {
    it('should calculate in-degrees and out-degrees', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'directed'
      );
      
      const result = GraphUtils.calculateDirectedDegrees(graph);
      
      expect(result.inDegrees.get('A')).toBe(0);
      expect(result.inDegrees.get('B')).toBe(1);
      expect(result.inDegrees.get('C')).toBe(2);
      
      expect(result.outDegrees.get('A')).toBe(2);
      expect(result.outDegrees.get('B')).toBe(1);
      expect(result.outDegrees.get('C')).toBe(0);
    });

    it('should handle self-loops in directed graphs', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [
          { source: 'A', target: 'A', weight: 1 }, // self-loop
          { source: 'A', target: 'B', weight: 1 }
        ],
        'directed'
      );
      
      const result = GraphUtils.calculateDirectedDegrees(graph);
      
      expect(result.inDegrees.get('A')).toBe(1); // from self-loop
      expect(result.inDegrees.get('B')).toBe(1);
      
      expect(result.outDegrees.get('A')).toBe(2); // self-loop + to B
      expect(result.outDegrees.get('B')).toBe(0);
    });
  });

  describe('getVerticesWithEdges', () => {
    it('should return empty set for graph with no edges', () => {
      const graph = createMockGraph(['A', 'B', 'C'], []);
      const result = GraphUtils.getVerticesWithEdges(graph);
      
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should return vertices that have edges', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'C', target: 'B', weight: 1 }
        ]
      );
      
      const result = GraphUtils.getVerticesWithEdges(graph);
      
      expect(result.size).toBe(3);
      expect(result.has('A')).toBe(true);
      expect(result.has('B')).toBe(true);
      expect(result.has('C')).toBe(true);
      expect(result.has('D')).toBe(false); // isolated vertex
    });
  });

  describe('separateVerticesByDegree', () => {
    it('should separate vertices by odd and even degrees', () => {
      const degrees = new Map<VertexId, number>([
        ['A', 1], // odd
        ['B', 2], // even
        ['C', 3], // odd
        ['D', 0], // even
        ['E', 4]  // even
      ]);
      
      const result = GraphUtils.separateVerticesByDegree(degrees);
      
      expect(result.oddDegreeVertices).toEqual(['A', 'C']);
      expect(result.evenDegreeVertices).toEqual(['B', 'D', 'E']);
    });

    it('should handle empty degree map', () => {
      const degrees = new Map<VertexId, number>();
      const result = GraphUtils.separateVerticesByDegree(degrees);
      
      expect(result.oddDegreeVertices).toEqual([]);
      expect(result.evenDegreeVertices).toEqual([]);
    });
  });

  describe('buildWeightedAdjacencyList', () => {
    it('should build weighted adjacency list with weights', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 5 },
          { source: 'B', target: 'C', weight: 3 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.buildWeightedAdjacencyList(graph, true);
      
      expect(result.get('A')).toEqual([{ target: 'B', weight: 5 }]);
      expect(result.get('B')).toEqual([
        { target: 'A', weight: 5 },
        { target: 'C', weight: 3 }
      ]);
      expect(result.get('C')).toEqual([{ target: 'B', weight: 3 }]);
    });

    it('should build unweighted adjacency list when isWeighted is false', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 5 },
          { source: 'B', target: 'C', weight: 3 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.buildWeightedAdjacencyList(graph, false);
      
      expect(result.get('A')).toEqual([{ target: 'B', weight: 1 }]);
      expect(result.get('B')).toEqual([
        { target: 'A', weight: 1 },
        { target: 'C', weight: 1 }
      ]);
      expect(result.get('C')).toEqual([{ target: 'B', weight: 1 }]);
    });

    it('should handle directed graphs correctly', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 5 },
          { source: 'B', target: 'C', weight: 3 }
        ],
        'directed'
      );
      
      const result = GraphUtils.buildWeightedAdjacencyList(graph, true);
      
      expect(result.get('A')).toEqual([{ target: 'B', weight: 5 }]);
      expect(result.get('B')).toEqual([{ target: 'C', weight: 3 }]);
      expect(result.get('C')).toEqual([]);
    });
  });

  describe('buildWeightedAdjacencyListWithEdges', () => {
    it('should build weighted adjacency list with edge IDs', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 5 },
          { id: 'e2', source: 'B', target: 'C', weight: 3 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.buildWeightedAdjacencyListWithEdges(graph);
      
      expect(result.get('A')).toEqual([{ vertex: 'B', weight: 5, edgeId: 'e1' }]);
      expect(result.get('B')).toEqual([
        { vertex: 'A', weight: 5, edgeId: 'e1' },
        { vertex: 'C', weight: 3, edgeId: 'e2' }
      ]);
      expect(result.get('C')).toEqual([{ vertex: 'B', weight: 3, edgeId: 'e2' }]);
    });

    it('should handle directed graphs with edge IDs', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 5 },
          { id: 'e2', source: 'B', target: 'C', weight: 3 }
        ],
        'directed'
      );
      
      const result = GraphUtils.buildWeightedAdjacencyListWithEdges(graph);
      
      expect(result.get('A')).toEqual([{ vertex: 'B', weight: 5, edgeId: 'e1' }]);
      expect(result.get('B')).toEqual([{ vertex: 'C', weight: 3, edgeId: 'e2' }]);
      expect(result.get('C')).toEqual([]);
    });
  });

  describe('analyzeGraph', () => {
    it('should analyze an empty graph', () => {
      const graph = createMockGraph([], []);
      const result = GraphUtils.analyzeGraph(graph);
      
      expect(result.vertexCount).toBe(0);
      expect(result.edgeCount).toBe(0);
      expect(result.minDegree).toBe(0);
      expect(result.maxDegree).toBe(0);
      expect(result.isConnected).toBe(true); // empty graph is considered connected
    });

    it('should analyze a simple connected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.analyzeGraph(graph);
      
      expect(result.vertexCount).toBe(3);
      expect(result.edgeCount).toBe(2);
      expect(result.minDegree).toBe(1);
      expect(result.maxDegree).toBe(2);
      expect(result.vertices).toEqual(['A', 'B', 'C']);
      expect(result.edges).toHaveLength(2);
    });

    it('should analyze a graph with isolated vertices', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { source: 'A', target: 'B', weight: 1 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.analyzeGraph(graph);
      
      expect(result.vertexCount).toBe(4);
      expect(result.edgeCount).toBe(1);
      expect(result.minDegree).toBe(0); // isolated vertices
      expect(result.maxDegree).toBe(1);
      expect(result.isConnected).toBe(false); // has isolated vertices
    });
  });

  describe('isConnectedConsideringOnlyVerticesWithEdges', () => {
    it('should return true for empty graph', () => {
      const graph = createMockGraph([], []);
      const result = GraphUtils.isConnectedConsideringOnlyVerticesWithEdges(graph);
      expect(result).toBe(true);
    });

    it('should return true for single vertex graph', () => {
      const graph = createMockGraph(['A'], []);
      const result = GraphUtils.isConnectedConsideringOnlyVerticesWithEdges(graph);
      expect(result).toBe(true);
    });

    it('should return true when vertices with edges are connected', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'], // D is isolated
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'undirected'
      );
      
      const result = GraphUtils.isConnectedConsideringOnlyVerticesWithEdges(graph);
      expect(result).toBe(true); // A, B, C are connected; D is ignored
    });

    it('should return false when vertices with edges are disconnected', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D', 'E'],
        [
          { source: 'A', target: 'B', weight: 1 }, // component 1
          { source: 'C', target: 'D', weight: 1 }  // component 2
        ],
        'undirected'
      );
      
      const result = GraphUtils.isConnectedConsideringOnlyVerticesWithEdges(graph);
      expect(result).toBe(false); // two disconnected components
    });

    it('should handle directed graphs correctly', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ],
        'directed'
      );
      
      const result = GraphUtils.isConnectedConsideringOnlyVerticesWithEdges(graph);
      expect(result).toBe(false); // directed graph A->B->C is not strongly connected
    });
  });

  describe('error cases and edge conditions', () => {
    it('should handle graphs with duplicate edges gracefully', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'B', weight: 2 } // duplicate edge with different weight
        ],
        'undirected'
      );
      
      const degrees = GraphUtils.calculateVertexDegrees(graph);
      expect(degrees.get('A')).toBe(2); // counts both edges
      expect(degrees.get('B')).toBe(2);
      
      const adjacencyList = GraphUtils.buildAdjacencyList(graph);
      expect(adjacencyList.get('A')).toEqual(new Set(['B'])); // Set deduplicates
    });

    it('should handle zero and negative weights', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { source: 'A', target: 'B', weight: 0 },
          { source: 'B', target: 'C', weight: -5 }
        ],
        'undirected'
      );
      
      const weightedList = GraphUtils.buildWeightedAdjacencyList(graph, true);
      expect(weightedList.get('A')).toEqual([{ target: 'B', weight: 0 }]);
      expect(weightedList.get('B')).toContainEqual({ target: 'C', weight: -5 });
    });

    it('should handle very large graphs efficiently', () => {
      const vertices = Array.from({ length: 1000 }, (_, i) => `v${i}`);
      const edges = Array.from({ length: 999 }, (_, i) => ({
        source: `v${i}`,
        target: `v${i + 1}`,
        weight: i + 1
      }));
      
      const graph = createMockGraph(vertices, edges, 'undirected');
      
      // This should not throw or take too long
      const start = Date.now();
      const result = GraphUtils.analyzeGraph(graph);
      const duration = Date.now() - start;
      
      expect(result.vertexCount).toBe(1000);
      expect(result.edgeCount).toBe(999);
      expect(duration).toBeLessThan(1000); // Should be fast
    });
  });
});
