import { describe, it, expect, beforeEach } from 'vitest';
import { AllPairsShortestPathService, type AllPairsAlgorithm } from '../AllPairsShortestPathService';
import { MockGraph } from './testUtils';

describe('AllPairsShortestPathService', () => {
  let graph: MockGraph;

  beforeEach(() => {
    graph = new MockGraph();
  });

  describe('Floyd-Warshall Algorithm', () => {
    it('should compute shortest paths for a simple triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 1);
      graph.addEdge(b, c, 2);
      graph.addEdge(a, c, 5);

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        expect(result.distances.get('A')?.get('B')).toBe(1);
        expect(result.distances.get('A')?.get('C')).toBe(3); // A->B->C = 1+2 = 3, better than direct 5
        expect(result.distances.get('B')?.get('C')).toBe(2);
        expect(result.algorithm).toBe('floyd-warshall');
      }
    });

    it('should handle unweighted graphs', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 5); // Weight should be ignored
      graph.addEdge(b, c, 10); // Weight should be ignored

      const result = AllPairsShortestPathService.floydWarshall(graph, false);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        expect(result.distances.get('A')?.get('B')).toBe(1);
        expect(result.distances.get('A')?.get('C')).toBe(2); // A->B->C = 1+1 = 2
        expect(result.distances.get('B')?.get('C')).toBe(1);
      }
    });

    it('should detect negative cycles', () => {
      graph.transitionGraphType('directed');
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 1);
      graph.addEdge(b, c, -3);
      graph.addEdge(c, a, 1); // This creates a negative cycle: A->B->C->A = 1+(-3)+1 = -1

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).toHaveProperty('type', 'negative_cycle');
    });

    it('should work with directed graphs', () => {
      graph.transitionGraphType('directed');
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 2);
      graph.addEdge(b, c, 3);
      graph.addEdge(c, a, 1); // Only in this direction

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        expect(result.distances.get('A')?.get('C')).toBe(5); // A->B->C
        expect(result.distances.get('C')?.get('A')).toBe(1); // Direct edge
        expect(result.distances.get('C')?.get('B')).toBe(3); // C->A->B
      }
    });
  });

  describe('Johnson Algorithm', () => {
    it('should compute shortest paths for a simple triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 1);
      graph.addEdge(b, c, 2);
      graph.addEdge(a, c, 5);

      const result = AllPairsShortestPathService.johnson(graph, true);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        expect(result.distances.get('A')?.get('B')).toBe(1);
        expect(result.distances.get('A')?.get('C')).toBe(3); // A->B->C = 1+2 = 3
        expect(result.distances.get('B')?.get('C')).toBe(2);
        expect(result.algorithm).toBe('johnson');
      }
    });

    it('should handle unweighted graphs', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 5); // Weight should be ignored
      graph.addEdge(b, c, 10); // Weight should be ignored

      const result = AllPairsShortestPathService.johnson(graph, false);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        expect(result.distances.get('A')?.get('B')).toBe(1);
        expect(result.distances.get('A')?.get('C')).toBe(2);
        expect(result.distances.get('B')?.get('C')).toBe(1);
      }
    });

    it('should detect negative cycles', () => {
      graph.transitionGraphType('directed');
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 1);
      graph.addEdge(b, c, -3);
      graph.addEdge(c, a, 1); // Negative cycle

      const result = AllPairsShortestPathService.johnson(graph, true);

      expect(result).toHaveProperty('type', 'negative_cycle');
    });
  });

  describe('Path Reconstruction', () => {
    it('should reconstruct paths correctly', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');

      graph.addEdge(a, b, 1);
      graph.addEdge(b, c, 1);

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        const path = AllPairsShortestPathService.reconstructPath(
          result.predecessors,
          'A',
          'C'
        );
        expect(path).toEqual(['A', 'B', 'C']);
      }
    });

    it('should return empty path for unreachable vertices', () => {
      graph.transitionGraphType('directed');
      graph.addVertex('A');
      graph.addVertex('B');

      // No edges, so B is unreachable from A

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).not.toHaveProperty('type');
      if ('distances' in result) {
        const path = AllPairsShortestPathService.reconstructPath(
          result.predecessors,
          'A',
          'B'
        );
        expect(path).toEqual([]);
      }
    });
  });

  describe('Main Interface', () => {
    it('should dispatch to Floyd-Warshall', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      graph.addEdge(a, b, 1);

      const result = AllPairsShortestPathService.computeAllPairsShortestPaths(
        graph,
        'floyd-warshall',
        true
      );

      expect(result).not.toHaveProperty('type');
      if ('algorithm' in result) {
        expect(result.algorithm).toBe('floyd-warshall');
      }
    });

    it('should dispatch to Johnson', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      graph.addEdge(a, b, 1);

      const result = AllPairsShortestPathService.computeAllPairsShortestPaths(
        graph,
        'johnson',
        true
      );

      expect(result).not.toHaveProperty('type');
      if ('algorithm' in result) {
        expect(result.algorithm).toBe('johnson');
      }
    });

    it('should handle unknown algorithms', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      graph.addEdge(a, b, 1);

      // Test with an invalid algorithm by casting to bypass TypeScript checking
      const result = AllPairsShortestPathService.computeAllPairsShortestPaths(
        graph,
        'invalid-algorithm' as AllPairsAlgorithm,
        true
      );

      expect(result).toHaveProperty('type', 'validation');
      if ('message' in result) {
        expect(result.message).toContain('Unknown algorithm');
      }
    });
  });

  describe('Validation', () => {
    it('should require at least 2 vertices', () => {
      graph.addVertex('A');

      const result = AllPairsShortestPathService.floydWarshall(graph, true);

      expect(result).toHaveProperty('type', 'validation');
      expect(result).toHaveProperty('message', 'All-pairs shortest path computation requires at least 2 vertices');
    });
  });
});
