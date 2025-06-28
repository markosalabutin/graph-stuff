import { describe, it, expect, vi } from 'vitest';
import { ShortestPathService } from '../ShortestPathService';
import type { GraphAPI } from '../../context/GraphContext';
import type { VertexId, Weight } from '../../domain/Graph';

// Mock GraphAPI implementation for testing
const createMockGraph = (
  vertices: VertexId[],
  edges: Array<{ source: VertexId; target: VertexId; weight: Weight }>,
  graphType: 'directed' | 'undirected' = 'directed'
): GraphAPI => {
  return {
    getVertices: () => vertices,
    getEdges: () => edges.map((edge, index) => ({ id: `e${index}`, ...edge })),
    getGraphType: () => graphType,
    addVertex: vi.fn(),
    getVertex: vi.fn(),
    addEdge: vi.fn(),
    setEdgeWeight: vi.fn(),
    removeVertex: vi.fn(),
    removeEdge: vi.fn(),
    transitionGraphType: vi.fn(),
  };
};

describe('ShortestPathService', () => {
  describe('Graph Validation', () => {
    it('should reject undirected graphs', () => {
      const graph = createMockGraph(['A', 'B'], [{ source: 'A', target: 'B', weight: 1 }], 'undirected');
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Shortest path algorithms require directed graphs'
      });
    });

    it('should reject graphs with insufficient vertices', () => {
      const graph = createMockGraph(['A'], [], 'directed');
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'A');
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Shortest path computation requires at least 2 vertices'
      });
    });

    it('should reject non-existent source vertex', () => {
      const graph = createMockGraph(['A', 'B'], [{ source: 'A', target: 'B', weight: 1 }]);
      
      const result = ShortestPathService.dijkstra(graph, 'C', 'B');
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Source vertex "C" does not exist in the graph'
      });
    });

    it('should reject non-existent target vertex', () => {
      const graph = createMockGraph(['A', 'B'], [{ source: 'A', target: 'B', weight: 1 }]);
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'C');
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Target vertex "C" does not exist in the graph'
      });
    });

    it('should reject unreachable target vertices', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'], 
        [{ source: 'A', target: 'B', weight: 1 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'C');
      
      expect(result).toEqual({
        type: 'unreachable',
        message: 'Target vertex "C" is not reachable from source vertex "A"'
      });
    });

    it('should reject negative weights for Dijkstra', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: -1 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toEqual({
        type: 'negative_weights',
        message: 'Dijkstra algorithm cannot handle negative edge weights. Use Bellman-Ford instead.'
      });
    });

    it('should accept negative weights for Bellman-Ford', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: -1 }]
      );
      
      const result = ShortestPathService.bellmanFord(graph, 'A', 'B');
      
      expect(result).not.toHaveProperty('type');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('totalDistance');
    });
  });

  describe('Dijkstra Algorithm', () => {
    it('should compute shortest path for simple two-vertex graph', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 5 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 5
      });
    });

    it('should compute shortest path for triangle graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'], 
        [
          { source: 'A', target: 'B', weight: 4 },
          { source: 'A', target: 'C', weight: 2 },
          { source: 'C', target: 'B', weight: 1 }
        ]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'C', 'B'],
        totalDistance: 3
      });
    });

    it('should handle direct path when it is shortest', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'], 
        [
          { source: 'A', target: 'B', weight: 2 },
          { source: 'A', target: 'C', weight: 4 },
          { source: 'C', target: 'B', weight: 1 }
        ]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 2
      });
    });

    it('should compute shortest path in complex graph', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'], 
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 4 },
          { source: 'B', target: 'C', weight: 2 },
          { source: 'B', target: 'D', weight: 5 },
          { source: 'C', target: 'D', weight: 1 }
        ]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'D');
      
      expect(result).toMatchObject({
        path: ['A', 'B', 'C', 'D'],
        totalDistance: 4
      });
    });

    it('should handle same source and target', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 1 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'A');
      
      expect(result).toMatchObject({
        path: ['A'],
        totalDistance: 0
      });
    });
  });

  describe('Bellman-Ford Algorithm', () => {
    it('should compute shortest path for simple graph', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 3 }]
      );
      
      const result = ShortestPathService.bellmanFord(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 3,
        hasNegativeCycle: false
      });
    });

    it('should handle negative weights correctly', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'], 
        [
          { source: 'A', target: 'B', weight: 4 },
          { source: 'A', target: 'C', weight: 5 },
          { source: 'B', target: 'C', weight: -10 }
        ]
      );
      
      const result = ShortestPathService.bellmanFord(graph, 'A', 'C');
      
      expect(result).toMatchObject({
        path: ['A', 'B', 'C'],
        totalDistance: -6,
        hasNegativeCycle: false
      });
    });

    it('should detect negative cycles', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C'], 
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: -3 },
          { source: 'C', target: 'B', weight: 1 }
        ]
      );
      
      const result = ShortestPathService.bellmanFord(graph, 'A', 'C');
      
      expect(result).toEqual({
        type: 'negative_cycle',
        message: 'Graph contains a negative-weight cycle reachable from the source'
      });
    });

    it('should compute same result as Dijkstra for non-negative weights', () => {
      const graph = createMockGraph(
        ['A', 'B', 'C', 'D'], 
        [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 4 },
          { source: 'B', target: 'C', weight: 2 },
          { source: 'B', target: 'D', weight: 5 },
          { source: 'C', target: 'D', weight: 1 }
        ]
      );
      
      const dijkstraResult = ShortestPathService.dijkstra(graph, 'A', 'D');
      const bellmanFordResult = ShortestPathService.bellmanFord(graph, 'A', 'D');
      
      expect(dijkstraResult).toMatchObject({
        path: ['A', 'B', 'C', 'D'],
        totalDistance: 4
      });
      
      expect(bellmanFordResult).toMatchObject({
        path: ['A', 'B', 'C', 'D'],
        totalDistance: 4,
        hasNegativeCycle: false
      });
    });

    it('should handle same source and target', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 1 }]
      );
      
      const result = ShortestPathService.bellmanFord(graph, 'A', 'A');
      
      expect(result).toMatchObject({
        path: ['A'],
        totalDistance: 0,
        hasNegativeCycle: false
      });
    });
  });

  describe('Convenience Method', () => {
    it('should use Dijkstra by default', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 2 }]
      );
      
      const result = ShortestPathService.computeShortestPath(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 2
      });
      expect(result).not.toHaveProperty('hasNegativeCycle');
    });

    it('should use Bellman-Ford when specified', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 2 }]
      );
      
      const result = ShortestPathService.computeShortestPath(graph, 'A', 'B', 'bellman-ford');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 2,
        hasNegativeCycle: false
      });
    });

    it('should reject unknown algorithms', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 2 }]
      );
      
      // @ts-expect-error Testing invalid algorithm
      const result = ShortestPathService.computeShortestPath(graph, 'A', 'B', 'invalid');
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Unknown algorithm: invalid'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-weight edges', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 0 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 0
      });
    });

    it('should handle large weights', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 1000000 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 1000000
      });
    });

    it('should handle fractional weights', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [{ source: 'A', target: 'B', weight: 1.5 }]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 1.5
      });
    });

    it('should handle multiple edges between same vertices', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [
          { source: 'A', target: 'B', weight: 5 },
          { source: 'A', target: 'B', weight: 2 }
        ]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 2
      });
    });

    it('should handle self-loops', () => {
      const graph = createMockGraph(
        ['A', 'B'], 
        [
          { source: 'A', target: 'A', weight: 1 },
          { source: 'A', target: 'B', weight: 3 }
        ]
      );
      
      const result = ShortestPathService.dijkstra(graph, 'A', 'B');
      
      expect(result).toMatchObject({
        path: ['A', 'B'],
        totalDistance: 3
      });
    });
  });

  describe('Performance', () => {
    it('should handle reasonably large graphs efficiently', () => {
      const vertices = Array.from({ length: 100 }, (_, i) => `V${i}`);
      const edges = [];
      
      // Create a chain: V0 -> V1 -> V2 -> ... -> V99
      for (let i = 0; i < 99; i++) {
        edges.push({ source: `V${i}`, target: `V${i + 1}`, weight: 1 });
      }
      
      const graph = createMockGraph(vertices, edges);
      
      const start = performance.now();
      const result = ShortestPathService.dijkstra(graph, 'V0', 'V99');
      const end = performance.now();
      
      expect(result).toMatchObject({
        totalDistance: 99
      });
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
