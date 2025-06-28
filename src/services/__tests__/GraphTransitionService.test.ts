import { describe, it, expect, beforeEach } from 'vitest';
import { createGraph, addVertex, addEdge, getVertices, getEdges } from '../../domain/GraphModel';
import { transitionGraphType } from '../GraphTransitionService';
import type { Graph } from '../../domain/Graph';

describe('GraphTransitionService', () => {
  let undirectedGraph: Graph;
  let directedGraph: Graph;

  beforeEach(() => {
    undirectedGraph = createGraph('undirected');
    directedGraph = createGraph('directed');
  });

  describe('undirected to directed transition', () => {
    it('should create bidirectional edges from undirected edges', () => {
      const v1 = addVertex(undirectedGraph, 'A');
      const v2 = addVertex(undirectedGraph, 'B');
      const v3 = addVertex(undirectedGraph, 'C');
      
      const edge1 = addEdge(undirectedGraph, v1, v2, 1);
      const edge2 = addEdge(undirectedGraph, v2, v3, 2);

      const result = transitionGraphType(undirectedGraph, 'directed');

      expect(result.newGraph.type).toBe('directed');

      const newVertices = getVertices(result.newGraph);
      expect(newVertices).toContain('A');
      expect(newVertices).toContain('B');
      expect(newVertices).toContain('C');
      expect(newVertices).toHaveLength(3);

      const newEdges = getEdges(result.newGraph);
      expect(newEdges).toHaveLength(4);

      const abEdges = newEdges.filter(e => 
        (e.source === 'A' && e.target === 'B') || 
        (e.source === 'B' && e.target === 'A')
      );
      expect(abEdges).toHaveLength(2);
      expect(abEdges.every(e => e.weight === 1)).toBe(true);

      const bcEdges = newEdges.filter(e => 
        (e.source === 'B' && e.target === 'C') || 
        (e.source === 'C' && e.target === 'B')
      );
      expect(bcEdges).toHaveLength(2);
      expect(bcEdges.every(e => e.weight === 2)).toBe(true);

      expect(result.edgeMapping[edge1]).toHaveLength(2);
      expect(result.edgeMapping[edge2]).toHaveLength(2);
    });
  });

  describe('directed to undirected transition', () => {
    it('should remove duplicate edges and create single undirected edges', () => {
      const v1 = addVertex(directedGraph, 'A');
      const v2 = addVertex(directedGraph, 'B');
      const v3 = addVertex(directedGraph, 'C');
      
      const edge1 = addEdge(directedGraph, v1, v2, 1);
      const edge2 = addEdge(directedGraph, v2, v1, 1);
      
      const edge3 = addEdge(directedGraph, v2, v3, 2);

      const result = transitionGraphType(directedGraph, 'undirected');

      expect(result.newGraph.type).toBe('undirected');

      const newVertices = getVertices(result.newGraph);
      expect(newVertices).toContain('A');
      expect(newVertices).toContain('B');
      expect(newVertices).toContain('C');
      expect(newVertices).toHaveLength(3);

      const newEdges = getEdges(result.newGraph);
      expect(newEdges).toHaveLength(2);

      const abEdge = newEdges.find(e => 
        (e.source === 'A' && e.target === 'B') || 
        (e.source === 'B' && e.target === 'A')
      );
      expect(abEdge).toBeDefined();
      expect(abEdge!.weight).toBe(1);

      const bcEdge = newEdges.find(e => 
        (e.source === 'B' && e.target === 'C') || 
        (e.source === 'C' && e.target === 'B')
      );
      expect(bcEdge).toBeDefined();
      expect(bcEdge!.weight).toBe(2);

      expect(result.edgeMapping[edge1]).toHaveLength(1);
      expect(result.edgeMapping[edge2]).toHaveLength(1);
      expect(result.edgeMapping[edge1][0]).toBe(result.edgeMapping[edge2][0]);
      expect(result.edgeMapping[edge3]).toHaveLength(1);
    });

    it('should handle unidirectional edges correctly', () => {
      const v1 = addVertex(directedGraph, 'A');
      const v2 = addVertex(directedGraph, 'B');
      
      const edge1 = addEdge(directedGraph, v1, v2, 3);

      const result = transitionGraphType(directedGraph, 'undirected');

      const newEdges = getEdges(result.newGraph);
      expect(newEdges).toHaveLength(1);
      
      const edge = newEdges[0];
      expect(
        (edge.source === 'A' && edge.target === 'B') || 
        (edge.source === 'B' && edge.target === 'A')
      ).toBe(true);
      expect(edge.weight).toBe(3);

      expect(result.edgeMapping[edge1]).toHaveLength(1);
    });
  });

  describe('same type transition', () => {
    it('should return the same graph when transitioning to the same type', () => {
      const v1 = addVertex(undirectedGraph, 'A');
      const v2 = addVertex(undirectedGraph, 'B');
      const edge1 = addEdge(undirectedGraph, v1, v2, 1);

      const result = transitionGraphType(undirectedGraph, 'undirected');

      expect(result.newGraph).toBe(undirectedGraph);
      expect(result.vertexMapping['A']).toBe('A');
      expect(result.vertexMapping['B']).toBe('B');
      expect(result.edgeMapping[edge1]).toEqual([edge1]);
    });
  });
});
