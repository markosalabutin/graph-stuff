import { describe, it, expect, beforeEach } from 'vitest';
import { EulerianPathService } from '../EulerianPathService';
import { MockGraph } from './testUtils';

describe('EulerianPathService', () => {
  let graph: MockGraph;

  beforeEach(() => {
    graph = new MockGraph();
  });

  describe('analyzeGraph', () => {
    it('should handle empty graph', () => {
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      expect(analysis.oddDegreeVertices).toEqual([]);
      expect(analysis.evenDegreeVertices).toEqual([]);
      expect(analysis.vertexDegrees.size).toBe(0);
      expect(analysis.isConnected).toBe(true);
    });

    it('should analyze single vertex', () => {
      graph.addVertex('A');
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      expect(analysis.oddDegreeVertices).toEqual([]);
      expect(analysis.evenDegreeVertices).toEqual(['A']);
      expect(analysis.vertexDegrees.get('A')).toBe(0);
      expect(analysis.isConnected).toBe(true);
    });

    it('should analyze simple path', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      expect(analysis.oddDegreeVertices.sort()).toEqual(['A', 'C']);
      expect(analysis.evenDegreeVertices).toEqual(['B']);
      expect(analysis.vertexDegrees.get('A')).toBe(1);
      expect(analysis.vertexDegrees.get('B')).toBe(2);
      expect(analysis.vertexDegrees.get('C')).toBe(1);
      expect(analysis.isConnected).toBe(true);
    });

    it('should analyze simple cycle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      expect(analysis.oddDegreeVertices).toEqual([]);
      expect(analysis.evenDegreeVertices.sort()).toEqual(['A', 'B', 'C']);
      expect(analysis.vertexDegrees.get('A')).toBe(2);
      expect(analysis.vertexDegrees.get('B')).toBe(2);
      expect(analysis.vertexDegrees.get('C')).toBe(2);
      expect(analysis.isConnected).toBe(true);
    });

    it('should detect disconnected graph', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      graph.addEdge(a, b);
      graph.addEdge(c, d);
      
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      expect(analysis.isConnected).toBe(false);
    });
  });

  describe('findEulerianPath', () => {
    it('should find Eulerian cycle in triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(true);
      expect(result.hasEulerianCycle).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path!.length).toBe(4); // Should visit all 3 vertices and return to start
    });

    it('should find Eulerian path in simple path', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(true);
      expect(result.hasEulerianCycle).toBe(false);
      expect(result.path).toBeDefined();
      expect(result.path!.length).toBeGreaterThanOrEqual(3);
      expect(result.startVertex).toBe('A');
      expect(result.endVertex).toBe('C');
    });

    it('should handle empty graph', () => {
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(true);
      expect(result.hasEulerianCycle).toBe(true);
      expect(result.path).toEqual([]);
      expect(result.reason).toBe('Empty graph has trivial Eulerian path');
    });

    it('should handle single vertex', () => {
      graph.addVertex('A');
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(true);
      expect(result.hasEulerianCycle).toBe(true);
      expect(result.path).toEqual(['A']);
    });

    it('should reject graph with vertices but no edges', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(false);
      expect(result.hasEulerianCycle).toBe(false);
      expect(result.reason).toBe('Graph with vertices but no edges cannot have Eulerian path');
    });

    it('should reject disconnected graph', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      graph.addEdge(a, b);
      graph.addEdge(c, d);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(false);
      expect(result.hasEulerianCycle).toBe(false);
      expect(result.reason).toBe('Graph is not connected');
    });

    it('should reject graph with more than 2 odd degree vertices', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      // Star graph - center has degree 3, others have degree 1 (4 odd vertices total)
      graph.addEdge(a, b);
      graph.addEdge(a, c);
      graph.addEdge(a, d);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(false);
      expect(result.hasEulerianCycle).toBe(false);
      expect(result.reason).toBe('Graph has 4 vertices with odd degree. Need exactly 0 or 2 for Eulerian path.');
    });

    it('should handle complex graph with no Eulerian path', () => {
      // Create a complete graph K4 (square with both diagonals)
      // Each vertex has degree 3, so 4 odd vertices = no Eulerian path/cycle
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, d);
      graph.addEdge(d, a);
      graph.addEdge(a, c);
      graph.addEdge(b, d);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(false);
      expect(result.hasEulerianCycle).toBe(false);
      expect(result.reason).toBe('Graph has 4 vertices with odd degree. Need exactly 0 or 2 for Eulerian path.');
    });
  });

  describe('directed graphs', () => {
    beforeEach(() => {
      graph.transitionGraphType('directed');
    });

    it('should analyze directed graph degrees correctly', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const analysis = EulerianPathService.analyzeGraph(graph);
      
      // In directed graphs, we look at in-degree + out-degree
      expect(analysis.vertexDegrees.get('A')).toBe(2); // out: 1, in: 1
      expect(analysis.vertexDegrees.get('B')).toBe(2); // out: 1, in: 1
      expect(analysis.vertexDegrees.get('C')).toBe(2); // out: 1, in: 1
    });

    it('should find Eulerian cycle in directed triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const result = EulerianPathService.findEulerianPath(graph);
      
      expect(result.hasEulerianPath).toBe(true);
      expect(result.hasEulerianCycle).toBe(true);
    });
  });
});
