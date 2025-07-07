import { describe, it, expect, beforeEach } from 'vitest';
import { HamiltonianPathService } from '../HamiltonianPathService';
import { MockGraph } from './testUtils';

describe('HamiltonianPathService', () => {
  let graph: MockGraph;

  beforeEach(() => {
    graph = new MockGraph();
  });

  describe('analyzeGraph', () => {
    it('should handle empty graph', () => {
      const analysis = HamiltonianPathService.analyzeGraph(graph);
      
      expect(analysis.vertexCount).toBe(0);
      expect(analysis.edgeCount).toBe(0);
      expect(analysis.minDegree).toBe(0);
      expect(analysis.maxDegree).toBe(0);
      expect(analysis.isConnected).toBe(true);
      expect(analysis.vertexDegrees.size).toBe(0);
    });

    it('should analyze single vertex', () => {
      graph.addVertex('A');
      const analysis = HamiltonianPathService.analyzeGraph(graph);
      
      expect(analysis.vertexCount).toBe(1);
      expect(analysis.edgeCount).toBe(0);
      expect(analysis.minDegree).toBe(0);
      expect(analysis.maxDegree).toBe(0);
      expect(analysis.isConnected).toBe(true);
      expect(analysis.vertexDegrees.get('A')).toBe(0);
    });

    it('should analyze simple path', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      
      const analysis = HamiltonianPathService.analyzeGraph(graph);
      
      expect(analysis.vertexCount).toBe(3);
      expect(analysis.edgeCount).toBe(2);
      expect(analysis.minDegree).toBe(1);
      expect(analysis.maxDegree).toBe(2);
      expect(analysis.isConnected).toBe(true);
      expect(analysis.vertexDegrees.get('A')).toBe(1);
      expect(analysis.vertexDegrees.get('B')).toBe(2);
      expect(analysis.vertexDegrees.get('C')).toBe(1);
    });

    it('should detect disconnected graph', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      graph.addEdge(a, b);
      graph.addEdge(c, d);
      
      const analysis = HamiltonianPathService.analyzeGraph(graph);
      
      expect(analysis.isConnected).toBe(false);
    });
  });

  describe('findHamiltonianPath', () => {
    it('should handle empty graph', () => {
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(true);
      expect(result.path).toEqual([]);
      expect(result.reason).toBe('Empty graph has trivial Hamiltonian path');
    });

    it('should handle single vertex', () => {
      graph.addVertex('A');
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(true);
      expect(result.path).toEqual(['A']);
      expect(result.startVertex).toBe('A');
      expect(result.endVertex).toBe('A');
      expect(result.reason).toBe('Single vertex is trivial Hamiltonian path');
    });

    it('should reject disconnected graph', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      graph.addEdge(a, b);
      graph.addEdge(c, d);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(false);
      expect(result.hasHamiltonianCycle).toBe(false);
      expect(result.reason).toBe('Graph is not connected');
    });

    it('should reject graph with no edges', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(false);
      expect(result.hasHamiltonianCycle).toBe(false);
      expect(result.reason).toBe('Graph has no edges');
    });

    it('should find Hamiltonian path in simple path', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(false);
      expect(result.path).toEqual(['A', 'B', 'C']);
    });

    it('should find Hamiltonian cycle in triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path!.length).toBe(3);
    });

    it('should find Hamiltonian cycle in complete graph K4', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      // Complete graph K4
      graph.addEdge(a, b);
      graph.addEdge(a, c);
      graph.addEdge(a, d);
      graph.addEdge(b, c);
      graph.addEdge(b, d);
      graph.addEdge(c, d);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path!.length).toBe(4);
      expect(result.reason).toContain("Dirac's theorem");
    });

    it('should handle large graphs by refusing to search', () => {
      // Create a graph with more than 15 vertices
      const vertices = [];
      for (let i = 0; i < 20; i++) {
        vertices.push(graph.addVertex(`V${i}`));
      }
      
      // Add some edges to make it connected
      for (let i = 0; i < vertices.length - 1; i++) {
        graph.addEdge(vertices[i], vertices[i + 1]);
      }
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(false);
      expect(result.hasHamiltonianCycle).toBe(false);
      expect(result.reason).toContain('computational complexity');
    });

    it('should provide search statistics when performing search', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      const d = graph.addVertex('D');
      
      // Create a sparse graph where search will occur
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, d);
      graph.addEdge(d, a);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.searchStats).toBeDefined();
      expect(result.searchStats!.nodesExplored).toBeGreaterThan(0);
      expect(result.searchStats!.maxDepth).toBeGreaterThan(0);
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
      
      const analysis = HamiltonianPathService.analyzeGraph(graph);
      
      // In directed graphs, we count out-degree only
      expect(analysis.vertexDegrees.get('A')).toBe(1);
      expect(analysis.vertexDegrees.get('B')).toBe(1);
      expect(analysis.vertexDegrees.get('C')).toBe(0);
    });

    it('should find Hamiltonian path in directed triangle', () => {
      const a = graph.addVertex('A');
      const b = graph.addVertex('B');
      const c = graph.addVertex('C');
      
      graph.addEdge(a, b);
      graph.addEdge(b, c);
      graph.addEdge(c, a);
      
      const result = HamiltonianPathService.findHamiltonianPath(graph);
      
      expect(result.hasHamiltonianPath).toBe(true);
      expect(result.hasHamiltonianCycle).toBe(true);
    });
  });
});
