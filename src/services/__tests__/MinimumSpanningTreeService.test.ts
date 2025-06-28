import { describe, it, expect, vi } from 'vitest';
import { 
  kruskalMST, 
  primMST, 
  computeMST
} from '../MinimumSpanningTreeService';
import type { GraphAPI } from '../../context/GraphContext';
import type { VertexId, EdgeId } from '../../domain/Graph';
import type { GraphType } from '../../domain/GraphModel';

const createMockGraph = (
  vertices: VertexId[],
  edges: Array<{ id: EdgeId; source: VertexId; target: VertexId; weight: number }>,
  graphType: GraphType = 'undirected'
): GraphAPI => ({
  getVertices: () => vertices,
  getEdges: () => edges,
  getGraphType: () => graphType,
  addVertex: vi.fn(),
  addEdge: vi.fn(),
  removeVertex: vi.fn(),
  removeEdge: vi.fn(),
  setEdgeWeight: vi.fn(),
  transitionGraphType: vi.fn(),
  getVertex: vi.fn()
});

describe('MinimumSpanningTreeService', () => {
  describe('Graph Validation', () => {
    it('should reject directed graphs', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B', weight: 5 }],
        'directed'
      );

      const result = kruskalMST(graph);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('directed_graph');
      }
    });

    it('should reject graphs with insufficient vertices', () => {
      const graph = createMockGraph(['A'], []);

      const result = kruskalMST(graph);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('insufficient_vertices');
      }
    });

    it('should reject disconnected graphs', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'C', target: 'D', weight: 2 }
        ]
      );

      const result = kruskalMST(graph);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('not_connected');
      }
    });
  });

  describe('Kruskal Algorithm', () => {
    it('should compute MST for simple triangle', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'B', target: 'C', weight: 2 },
          { id: 'e3', source: 'A', target: 'C', weight: 3 }
        ]
      );

      const result = kruskalMST(graph);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.edges).toHaveLength(2);
        expect(result.result.totalWeight).toBe(3);
        expect(result.result.algorithm).toBe('kruskal');
        
        const weights = result.result.edges.map(e => e.weight).sort();
        expect(weights).toEqual([1, 2]);
      }
    });

    it('should handle single edge graph', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B', weight: 10 }]
      );

      const result = kruskalMST(graph);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.edges).toHaveLength(1);
        expect(result.result.totalWeight).toBe(10);
      }
    });
  });

  describe('Prim Algorithm', () => {
    it('should compute MST for simple triangle', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'B', target: 'C', weight: 2 },
          { id: 'e3', source: 'A', target: 'C', weight: 3 }
        ]
      );

      const result = primMST(graph);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.edges).toHaveLength(2);
        expect(result.result.totalWeight).toBe(3);
        expect(result.result.algorithm).toBe('prim');
      }
    });

    it('should compute MST starting from specific vertex', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 1 },
          { id: 'e2', source: 'B', target: 'C', weight: 2 },
          { id: 'e3', source: 'C', target: 'D', weight: 3 },
          { id: 'e4', source: 'D', target: 'A', weight: 4 }
        ]
      );

      const result = primMST(graph, 'C');
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.edges).toHaveLength(3);
        expect(result.result.totalWeight).toBe(6);
      }
    });
  });

  describe('Algorithm Comparison', () => {
    it('should produce same MST weight for both algorithms', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D', 'E'],
        [
          { id: 'e1', source: 'A', target: 'B', weight: 10 },
          { id: 'e2', source: 'A', target: 'C', weight: 6 },
          { id: 'e3', source: 'A', target: 'D', weight: 5 },
          { id: 'e4', source: 'B', target: 'D', weight: 15 },
          { id: 'e5', source: 'C', target: 'D', weight: 4 },
          { id: 'e6', source: 'B', target: 'E', weight: 3 },
          { id: 'e7', source: 'D', target: 'E', weight: 8 }
        ]
      );

      const kruskalResult = kruskalMST(graph);
      const primResult = primMST(graph);

      expect(kruskalResult.success).toBe(true);
      expect(primResult.success).toBe(true);

      if (kruskalResult.success && primResult.success) {
        expect(kruskalResult.result.totalWeight).toBe(primResult.result.totalWeight);
        expect(kruskalResult.result.edges).toHaveLength(4);
        expect(primResult.result.edges).toHaveLength(4);
      }
    });
  });

  describe('Convenience Function', () => {
    it('should use Kruskal by default', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B', weight: 5 }]
      );

      const result = computeMST(graph);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.algorithm).toBe('kruskal');
      }
    });

    it('should use Prim when specified', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B', weight: 5 }]
      );

      const result = computeMST(graph, 'prim');
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.result.algorithm).toBe('prim');
      }
    });
  });
});
