/**
 * Tests for graph generator utilities
 * 
 * This test suite covers the generateCompleteGraph function, which creates
 * complete graphs (K_n) with vertices arranged in a circular layout.
 * 
 * Test coverage includes:
 * - Input validation (n must be between 1 and 50)
 * - Vertex creation and naming
 * - Edge creation for both directed and undirected graphs
 * - Position calculation and circular arrangement
 * - Mathematical correctness of complete graph properties
 * - Edge cases (K_1, K_2, K_50)
 * - Radius calculation and scaling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCompleteGraph } from '../GraphGeneratorService';
import { MockGraph } from './testUtils';
import type { VertexId } from '../../domain/Graph';

describe('GraphGeneratorService', () => {
  describe('generateCompleteGraph', () => {
    let mockPositions: Record<VertexId, { x: number; y: number }>;
    let mockSetPositions: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockPositions = {};
      mockSetPositions = vi.fn();
    });

    describe('validation', () => {
      it('should throw error for n < 1', () => {
        const graph = new MockGraph();
        
        expect(() => {
          generateCompleteGraph(graph, 0, mockPositions, mockSetPositions);
        }).toThrow('Number of vertices must be between 1 and 50');
      });

      it('should throw error for n > 50', () => {
        const graph = new MockGraph();
        
        expect(() => {
          generateCompleteGraph(graph, 51, mockPositions, mockSetPositions);
        }).toThrow('Number of vertices must be between 1 and 50');
      });

      it('should accept valid range 1-50', () => {
        const graph = new MockGraph();
        
        expect(() => {
          generateCompleteGraph(graph, 1, mockPositions, mockSetPositions);
        }).not.toThrow();

        expect(() => {
          generateCompleteGraph(graph, 50, mockPositions, mockSetPositions);
        }).not.toThrow();
      });
    });

    describe('vertex creation', () => {
      it('should create correct number of vertices', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 5, mockPositions, mockSetPositions);
        
        expect(vertices).toHaveLength(5);
        expect(graph.getVertices()).toHaveLength(5);
      });

      it('should return array of vertex IDs', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        
        vertices.forEach(vertex => {
          expect(typeof vertex).toBe('string');
          expect(vertex.length).toBeGreaterThan(0);
        });
      });
    });

    describe('edge creation for undirected graphs', () => {
      it('should create correct number of edges for undirected graph', () => {
        const graph = new MockGraph([], [], 'undirected');
        
        generateCompleteGraph(graph, 4, mockPositions, mockSetPositions);
        
        // Complete graph K_4 should have 4*(4-1)/2 = 6 edges
        expect(graph.getEdges()).toHaveLength(6);
      });

      it('should create all possible edges between vertices', () => {
        const graph = new MockGraph([], [], 'undirected');
        
        const vertices = generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        const edges = graph.getEdges();
        
        // K_3 should have 3 edges: (A,B), (A,C), (B,C)
        expect(edges).toHaveLength(3);
        
        // Check that all vertex pairs are connected
        const edgePairs = edges.map(edge => [edge.source, edge.target].sort());
        const expectedPairs = [
          [vertices[0], vertices[1]].sort(),
          [vertices[0], vertices[2]].sort(),
          [vertices[1], vertices[2]].sort(),
        ];
        
        expectedPairs.forEach(expectedPair => {
          expect(edgePairs).toContainEqual(expectedPair);
        });
      });

      it('should set edge weights to 1', () => {
        const graph = new MockGraph([], [], 'undirected');
        
        generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        const edges = graph.getEdges();
        
        edges.forEach(edge => {
          expect(edge.weight).toBe(1);
        });
      });
    });

    describe('edge creation for directed graphs', () => {
      it('should create correct number of edges for directed graph', () => {
        const graph = new MockGraph([], [], 'directed');
        
        generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        
        // Complete directed graph K_3 should have 3*(3-1) = 6 edges (both directions)
        expect(graph.getEdges()).toHaveLength(6);
      });

      it('should create bidirectional edges for directed graph', () => {
        const graph = new MockGraph([], [], 'directed');
        
        const vertices = generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        const edges = graph.getEdges();
        
        // Check that for each pair of vertices, both A->B and B->A exist
        for (let i = 0; i < vertices.length; i++) {
          for (let j = i + 1; j < vertices.length; j++) {
            const vertexA = vertices[i];
            const vertexB = vertices[j];
            
            // Check A->B exists
            expect(edges.some(edge => edge.source === vertexA && edge.target === vertexB)).toBe(true);
            // Check B->A exists
            expect(edges.some(edge => edge.source === vertexB && edge.target === vertexA)).toBe(true);
          }
        }
      });
    });

    describe('position calculation', () => {
      it('should call setPositions with new positions', () => {
        const graph = new MockGraph();
        
        generateCompleteGraph(graph, 3, mockPositions, mockSetPositions);
        
        expect(mockSetPositions).toHaveBeenCalledTimes(1);
        expect(mockSetPositions).toHaveBeenCalledWith(expect.any(Object));
      });

      it('should preserve existing positions and add new ones', () => {
        const graph = new MockGraph();
        const existingPositions = { 'X': { x: 100, y: 200 } };
        
        generateCompleteGraph(graph, 2, existingPositions, mockSetPositions);
        
        const calledPositions = mockSetPositions.mock.calls[0][0];
        expect(calledPositions).toHaveProperty('X');
        expect(calledPositions['X']).toEqual({ x: 100, y: 200 });
      });

      it('should place vertices in circular arrangement', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 4, mockPositions, mockSetPositions);
        const calledPositions = mockSetPositions.mock.calls[0][0];
        
        // Check that all vertices have positions
        vertices.forEach(vertex => {
          expect(calledPositions).toHaveProperty(vertex);
          expect(calledPositions[vertex]).toHaveProperty('x');
          expect(calledPositions[vertex]).toHaveProperty('y');
          expect(typeof calledPositions[vertex].x).toBe('number');
          expect(typeof calledPositions[vertex].y).toBe('number');
        });
      });

      it('should distribute vertices evenly around circle', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 4, mockPositions, mockSetPositions);
        const calledPositions = mockSetPositions.mock.calls[0][0];
        
        // For 4 vertices, they should be at angles 0, π/2, π, 3π/2
        // Calculate distances from center (700, 500)
        const centerX = 700;
        const centerY = 500;
        
        vertices.forEach(vertex => {
          const pos = calledPositions[vertex];
          const distance = Math.sqrt(
            Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
          );
          
          // All vertices should be approximately the same distance from center
          expect(distance).toBeGreaterThan(100); // Should be reasonable distance from center
          expect(distance).toBeLessThan(300); // Should not be too far
        });
      });
    });

    describe('edge cases', () => {
      it('should handle single vertex (K_1)', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 1, mockPositions, mockSetPositions);
        
        expect(vertices).toHaveLength(1);
        expect(graph.getVertices()).toHaveLength(1);
        expect(graph.getEdges()).toHaveLength(0); // No edges in K_1
      });

      it('should handle two vertices (K_2)', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 2, mockPositions, mockSetPositions);
        
        expect(vertices).toHaveLength(2);
        expect(graph.getEdges()).toHaveLength(1); // One edge in K_2
      });

      it('should handle maximum vertices (K_50)', () => {
        const graph = new MockGraph();
        
        const vertices = generateCompleteGraph(graph, 50, mockPositions, mockSetPositions);
        
        expect(vertices).toHaveLength(50);
        // K_50 should have 50*49/2 = 1225 edges
        expect(graph.getEdges()).toHaveLength(1225);
      });
    });

    describe('radius calculation', () => {
      it('should use correct radius formula for small graphs', () => {
        const graph = new MockGraph();
        
        // Test with n=5: radius should be min(150 + 5*3, 250) = min(165, 250) = 165
        generateCompleteGraph(graph, 5, mockPositions, mockSetPositions);
        const positions = mockSetPositions.mock.calls[0][0];
        
        const vertices = Object.keys(positions);
        if (vertices.length > 0) {
          const firstVertex = vertices[0];
          const pos = positions[firstVertex];
          const actualRadius = Math.sqrt(
            Math.pow(pos.x - 700, 2) + Math.pow(pos.y - 500, 2)
          );
          
          expect(actualRadius).toBeCloseTo(165, 1);
        }
      });

      it('should cap radius at 250 for large graphs', () => {
        const graph = new MockGraph();
        
        // Test with large n where 150 + n*3 > 250
        generateCompleteGraph(graph, 40, mockPositions, mockSetPositions);
        const positions = mockSetPositions.mock.calls[0][0];
        
        const vertices = Object.keys(positions);
        if (vertices.length > 0) {
          const firstVertex = vertices[0];
          const pos = positions[firstVertex];
          const actualRadius = Math.sqrt(
            Math.pow(pos.x - 700, 2) + Math.pow(pos.y - 500, 2)
          );
          
          expect(actualRadius).toBeCloseTo(250, 1);
        }
      });
    });

    describe('mathematical correctness', () => {
      it('should generate complete graphs with correct edge count formula', () => {
        const testCases = [
          { n: 3, expectedEdges: 3 },   // 3*2/2 = 3
          { n: 4, expectedEdges: 6 },   // 4*3/2 = 6  
          { n: 5, expectedEdges: 10 },  // 5*4/2 = 10
          { n: 10, expectedEdges: 45 }, // 10*9/2 = 45
        ];

        testCases.forEach(({ n, expectedEdges }) => {
          const graph = new MockGraph([], [], 'undirected');
          generateCompleteGraph(graph, n, {}, mockSetPositions);
          
          expect(graph.getEdges()).toHaveLength(expectedEdges);
        });
      });

      it('should generate directed complete graphs with correct edge count', () => {
        const testCases = [
          { n: 3, expectedEdges: 6 },   // 3*2 = 6
          { n: 4, expectedEdges: 12 },  // 4*3 = 12  
          { n: 5, expectedEdges: 20 },  // 5*4 = 20
        ];

        testCases.forEach(({ n, expectedEdges }) => {
          const graph = new MockGraph([], [], 'directed');
          generateCompleteGraph(graph, n, {}, mockSetPositions);
          
          expect(graph.getEdges()).toHaveLength(expectedEdges);
        });
      });
    });
  });
});
