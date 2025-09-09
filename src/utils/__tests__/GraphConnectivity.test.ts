import { describe, it, expect, vi } from 'vitest';
import {
  isGraphConnected,
  isDirectedGraphStronglyConnected,
} from '../GraphConnectivity';
import type { GraphAPI } from '../../context/GraphContext';
import type { VertexId, EdgeId } from '../../domain/Graph';
import type { GraphType } from '../../domain/GraphModel';

const createMockGraph = (
  vertices: VertexId[],
  edges: Array<{
    id: EdgeId;
    source: VertexId;
    target: VertexId;
    weight?: number;
  }>,
  graphType: GraphType = 'undirected'
): GraphAPI => ({
  getVertices: () => vertices,
  getEdges: () => edges.map((edge) => ({ ...edge, weight: edge.weight ?? 1 })),
  getGraphType: () => graphType,
  addVertex: vi.fn(),
  addEdge: vi.fn(),
  removeVertex: vi.fn(),
  removeEdge: vi.fn(),
  setEdgeWeight: vi.fn(),
  transitionGraphType: vi.fn(),
  getVertex: vi.fn(),
  resetFromDTO: vi.fn(),
});

describe('GraphConnectivity', () => {
  describe('isGraphConnected (Undirected)', () => {
    it('should return true for empty graph', () => {
      const graph = createMockGraph([], []);
      expect(isGraphConnected(graph)).toBe(true);
    });

    it('should return true for single vertex', () => {
      const graph = createMockGraph(['A'], []);
      expect(isGraphConnected(graph)).toBe(true);
    });

    it('should return true for connected two-vertex graph', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B' }]
      );
      expect(isGraphConnected(graph)).toBe(true);
    });

    it('should return false for disconnected two-vertex graph', () => {
      const graph = createMockGraph(['A', 'B'], []);
      expect(isGraphConnected(graph)).toBe(false);
    });

    it('should return true for connected triangle', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'A', target: 'C' },
        ]
      );
      expect(isGraphConnected(graph)).toBe(true);
    });

    it('should return true for linear connected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'C', target: 'D' },
        ]
      );
      expect(isGraphConnected(graph)).toBe(true);
    });

    it('should return false for disconnected components', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'C', target: 'D' },
        ]
      );
      expect(isGraphConnected(graph)).toBe(false);
    });

    it('should return false for isolated vertex', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [{ id: 'e1', source: 'A', target: 'B' }]
      );
      expect(isGraphConnected(graph)).toBe(false);
    });

    it('should handle complex connected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D', 'E'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'C', target: 'D' },
          { id: 'e4', source: 'D', target: 'E' },
          { id: 'e5', source: 'E', target: 'A' },
        ]
      );
      expect(isGraphConnected(graph)).toBe(true);
    });
  });

  describe('isDirectedGraphStronglyConnected', () => {
    it('should return true for empty graph', () => {
      const graph = createMockGraph([], [], 'directed');
      expect(isDirectedGraphStronglyConnected(graph)).toBe(true);
    });

    it('should return true for single vertex', () => {
      const graph = createMockGraph(['A'], [], 'directed');
      expect(isDirectedGraphStronglyConnected(graph)).toBe(true);
    });

    it('should return true for bidirectional two-vertex graph', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'A' },
        ],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(true);
    });

    it('should return false for unidirectional two-vertex graph', () => {
      const graph = createMockGraph(
        ['A', 'B'],
        [{ id: 'e1', source: 'A', target: 'B' }],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(false);
    });

    it('should return true for strongly connected triangle', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'C', target: 'A' },
        ],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(true);
    });

    it('should return false for weakly connected triangle', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
        ],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(false);
    });

    it('should return false for disconnected components', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'A' },
          { id: 'e3', source: 'C', target: 'D' },
        ],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(false);
    });

    it('should handle complex strongly connected graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'],
        [
          { id: 'e1', source: 'A', target: 'B' },
          { id: 'e2', source: 'B', target: 'C' },
          { id: 'e3', source: 'C', target: 'D' },
          { id: 'e4', source: 'D', target: 'A' },
          { id: 'e5', source: 'B', target: 'D' },
        ],
        'directed'
      );
      expect(isDirectedGraphStronglyConnected(graph)).toBe(true);
    });
  });
});
