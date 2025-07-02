import { describe, it, expect } from 'vitest';
import { GraphColoringService } from '../GraphColoringService';
import { MockGraph } from './testUtils';

describe('GraphColoringService', () => {
  describe('colorGraph', () => {
    it('should handle empty graph', () => {
      const graph = new MockGraph();
      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(0);
      expect(result.numColors).toBe(0);
      expect(result.colorClasses).toEqual([]);
    });

    it('should color single vertex', () => {
      const graph = new MockGraph();
      graph.addVertex('A');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(1);
      expect(result.coloring.get('A')).toBe(0);
      expect(result.numColors).toBe(1);
      expect(result.colorClasses).toEqual([['A']]);
    });

    it('should color two disconnected vertices with same color', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(2);
      expect(result.coloring.get('A')).toBe(0);
      expect(result.coloring.get('B')).toBe(0);
      expect(result.numColors).toBe(1);
      expect(result.colorClasses).toEqual([['A', 'B']]);
    });

    it('should color two connected vertices with different colors', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(2);
      expect(result.coloring.get('A')).toBe(0);
      expect(result.coloring.get('B')).toBe(1);
      expect(result.numColors).toBe(2);
      expect(result.colorClasses).toEqual([['A'], ['B']]);
    });

    it('should color triangle (K3) with 3 colors', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'A');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(3);
      expect(result.numColors).toBe(3);
      
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      
      const colors = Array.from(result.coloring.values());
      expect(new Set(colors).size).toBe(3);
    });

    it('should color complete graph K4 with 4 colors', () => {
      const graph = new MockGraph();
      const vertices = ['A', 'B', 'C', 'D'];
      
      vertices.forEach(v => graph.addVertex(v));
      
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          graph.addEdge(vertices[i], vertices[j]);
        }
      }

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(4);
      expect(result.numColors).toBe(4);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      
      // Each vertex should have different color
      const colors = Array.from(result.coloring.values());
      expect(new Set(colors).size).toBe(4);
    });

    it('should color bipartite graph with 2 colors', () => {
      const graph = new MockGraph();
      
      // Create bipartite graph K_{2,3}
      graph.addVertex('A1');
      graph.addVertex('A2');
      graph.addVertex('B1');
      graph.addVertex('B2');
      graph.addVertex('B3');
      
      // Connect A vertices to B vertices
      graph.addEdge('A1', 'B1');
      graph.addEdge('A1', 'B2');
      graph.addEdge('A1', 'B3');
      graph.addEdge('A2', 'B1');
      graph.addEdge('A2', 'B2');
      graph.addEdge('A2', 'B3');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(5);
      expect(result.numColors).toBe(2);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      
      // A vertices should have one color, B vertices another
      const colorA1 = result.coloring.get('A1')!;
      const colorB1 = result.coloring.get('B1')!;
      
      expect(result.coloring.get('A2')).toBe(colorA1);
      expect(result.coloring.get('B2')).toBe(colorB1);
      expect(result.coloring.get('B3')).toBe(colorB1);
      expect(colorA1).not.toBe(colorB1);
    });

    it('should handle star graph efficiently', () => {
      const graph = new MockGraph();
      
      // Create star graph: center connected to 5 outer vertices
      graph.addVertex('center');
      for (let i = 1; i <= 5; i++) {
        graph.addVertex(`outer${i}`);
        graph.addEdge('center', `outer${i}`);
      }

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(6);
      expect(result.numColors).toBe(2);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      
      // All outer vertices should have same color, center different
      const centerColor = result.coloring.get('center')!;
      const outerColor = result.coloring.get('outer1')!;
      
      expect(centerColor).not.toBe(outerColor);
      for (let i = 2; i <= 5; i++) {
        expect(result.coloring.get(`outer${i}`)).toBe(outerColor);
      }
    });

    it('should color path graph with 2 colors (alternating)', () => {
      const graph = new MockGraph();
      
      // Create path: A-B-C-D-E
      const vertices = ['A', 'B', 'C', 'D', 'E'];
      vertices.forEach(v => graph.addVertex(v));
      
      for (let i = 0; i < vertices.length - 1; i++) {
        graph.addEdge(vertices[i], vertices[i + 1]);
      }

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(5);
      expect(result.numColors).toBe(2);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      
      // Colors should alternate
      const colorA = result.coloring.get('A')!;
      const colorB = result.coloring.get('B')!;
      
      expect(colorA).not.toBe(colorB);
      expect(result.coloring.get('C')).toBe(colorA);
      expect(result.coloring.get('D')).toBe(colorB);
      expect(result.coloring.get('E')).toBe(colorA);
    });

    it('should handle cycle graphs correctly', () => {
      const graph = new MockGraph();
      
      // Create odd cycle (5-cycle): A-B-C-D-E-A
      const vertices = ['A', 'B', 'C', 'D', 'E'];
      vertices.forEach(v => graph.addVertex(v));
      
      for (let i = 0; i < vertices.length; i++) {
        graph.addEdge(vertices[i], vertices[(i + 1) % vertices.length]);
      }

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(5);
      expect(result.numColors).toBe(3); // Odd cycles require 3 colors
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
    });

    it('should produce deterministic results', () => {
      const graph = new MockGraph();
      
      // Create triangle
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'A');

      const result1 = GraphColoringService.colorGraph(graph);
      const result2 = GraphColoringService.colorGraph(graph);

      expect(result1.coloring).toEqual(result2.coloring);
      expect(result1.numColors).toBe(result2.numColors);
      expect(result1.colorClasses).toEqual(result2.colorClasses);
    });
  });

  describe('validateColoring', () => {
    it('should validate correct coloring', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');
      
      const coloring = new Map([['A', 0], ['B', 1]]);
      
      expect(GraphColoringService.validateColoring(graph, coloring)).toBe(true);
    });

    it('should invalidate incorrect coloring', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');
      
      const coloring = new Map([['A', 0], ['B', 0]]);
      
      expect(GraphColoringService.validateColoring(graph, coloring)).toBe(false);
    });

    it('should handle empty graph', () => {
      const graph = new MockGraph();
      const coloring = new Map();
      
      expect(GraphColoringService.validateColoring(graph, coloring)).toBe(true);
    });

    it('should handle partial coloring', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B');
      
      const coloring = new Map([['A', 0], ['B', 1]]); // C not colored
      
      expect(GraphColoringService.validateColoring(graph, coloring)).toBe(true);
    });
  });

  describe('getColoringBounds', () => {
    it('should return bounds for empty graph', () => {
      const graph = new MockGraph();
      const bounds = GraphColoringService.getColoringBounds(graph);
      
      expect(bounds.lowerBound).toBe(0);
      expect(bounds.upperBound).toBe(0);
    });

    it('should return bounds for single vertex', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      
      const bounds = GraphColoringService.getColoringBounds(graph);
      
      expect(bounds.lowerBound).toBe(1);
      expect(bounds.upperBound).toBe(1);
    });

    it('should return bounds for complete graph K4', () => {
      const graph = new MockGraph();
      const vertices = ['A', 'B', 'C', 'D'];
      
      vertices.forEach(v => graph.addVertex(v));
      
      // Add all edges
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          graph.addEdge(vertices[i], vertices[j]);
        }
      }
      
      const bounds = GraphColoringService.getColoringBounds(graph);
      
      expect(bounds.lowerBound).toBeGreaterThanOrEqual(4);
      expect(bounds.upperBound).toBe(4); // degree + 1 = 3 + 1 = 4
    });

    it('should return bounds for star graph', () => {
      const graph = new MockGraph();
      
      graph.addVertex('center');
      for (let i = 1; i <= 5; i++) {
        graph.addVertex(`outer${i}`);
        graph.addEdge('center', `outer${i}`);
      }
      
      const bounds = GraphColoringService.getColoringBounds(graph);
      
      expect(bounds.lowerBound).toBeGreaterThanOrEqual(2);
      expect(bounds.upperBound).toBe(6); // max degree + 1 = 5 + 1 = 6
    });

    it('should have lower bound not exceed upper bound', () => {
      const testCases = [
        { vertices: ['A'], edges: [] },
        { vertices: ['A', 'B'], edges: [['A', 'B']] },
        { vertices: ['A', 'B', 'C'], edges: [['A', 'B'], ['B', 'C']] },
        { vertices: ['A', 'B', 'C'], edges: [['A', 'B'], ['B', 'C'], ['C', 'A']] }
      ];
      
      for (const testCase of testCases) {
        const newGraph = new MockGraph();
        testCase.vertices.forEach(v => newGraph.addVertex(v));
        testCase.edges.forEach(([u, v]) => newGraph.addEdge(u, v));
        
        const bounds = GraphColoringService.getColoringBounds(newGraph);
        expect(bounds.lowerBound).toBeLessThanOrEqual(bounds.upperBound);
      }
    });
  });

  describe('edge cases and robustness', () => {
    it('should handle self-loops gracefully', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'A'); // self-loop
      graph.addEdge('A', 'B');

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(2);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
    });

    it('should handle multiple edges between same vertices', () => {
      const graph = new MockGraph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'B'); // duplicate edge
      graph.addEdge('B', 'A'); // reverse edge

      const result = GraphColoringService.colorGraph(graph);

      expect(result.coloring.size).toBe(2);
      expect(result.numColors).toBe(2);
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
    });

    it('should perform well on medium-sized graphs', () => {
      const graph = new MockGraph();
      
      // Create a grid-like graph (10x10)
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          graph.addVertex(`${i},${j}`);
        }
      }
      
      // Add edges (grid connections)
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (i < 9) graph.addEdge(`${i},${j}`, `${i+1},${j}`);
          if (j < 9) graph.addEdge(`${i},${j}`, `${i},${j+1}`);
        }
      }

      const start = Date.now();
      const result = GraphColoringService.colorGraph(graph);
      const duration = Date.now() - start;

      expect(result.coloring.size).toBe(100);
      expect(result.numColors).toBeLessThanOrEqual(4); // Grid graphs are 4-colorable
      expect(GraphColoringService.validateColoring(graph, result.coloring)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
