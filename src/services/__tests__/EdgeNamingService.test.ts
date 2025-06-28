import { describe, it, expect, beforeEach } from 'vitest';
import { EdgeNamingService } from '../EdgeNamingService';

describe('EdgeNamingService', () => {
  let service: EdgeNamingService;

  beforeEach(() => {
    service = new EdgeNamingService();
  });

  describe('generateEdgeId - Undirected Graphs', () => {
    it('should generate simple edge IDs for first edge between vertices', () => {
      expect(service.generateEdgeId('A', 'B', false)).toBe('A-B');
      expect(service.generateEdgeId('C', 'D', false)).toBe('C-D');
    });

    it('should normalize edge keys for undirected graphs', () => {
      expect(service.generateEdgeId('A', 'B', false)).toBe('A-B');
      expect(service.generateEdgeId('B', 'A', false)).toBe('A-B#2');
    });

    it('should handle multiple edges between same vertices', () => {
      expect(service.generateEdgeId('A', 'B', false)).toBe('A-B');
      expect(service.generateEdgeId('A', 'B', false)).toBe('A-B#2');
      expect(service.generateEdgeId('A', 'B', false)).toBe('A-B#3');
    });

    it('should normalize vertex order consistently', () => {
      expect(service.generateEdgeId('Z', 'A', false)).toBe('A-Z');
      expect(service.generateEdgeId('A', 'Z', false)).toBe('A-Z#2');
    });

    it('should handle self-loops in undirected graphs', () => {
      expect(service.generateEdgeId('A', 'A', false)).toBe('A-A');
      expect(service.generateEdgeId('A', 'A', false)).toBe('A-A#2');
    });
  });

  describe('generateEdgeId - Directed Graphs', () => {
    it('should generate simple edge IDs for first edge between vertices', () => {
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B');
      expect(service.generateEdgeId('C', 'D', true)).toBe('C-D');
    });

    it('should treat A->B and B->A as different edges in directed graphs', () => {
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B');
      expect(service.generateEdgeId('B', 'A', true)).toBe('B-A');
    });

    it('should handle multiple directed edges in same direction', () => {
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B');
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B#2');
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B#3');
    });

    it('should handle multiple directed edges in opposite directions', () => {
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B');
      expect(service.generateEdgeId('B', 'A', true)).toBe('B-A');
      expect(service.generateEdgeId('A', 'B', true)).toBe('A-B#2');
      expect(service.generateEdgeId('B', 'A', true)).toBe('B-A#2');
    });

    it('should handle self-loops in directed graphs', () => {
      expect(service.generateEdgeId('A', 'A', true)).toBe('A-A');
      expect(service.generateEdgeId('A', 'A', true)).toBe('A-A#2');
    });
  });

  describe('releaseEdgeId', () => {
    it('should release simple edge IDs', () => {
      const edgeId = service.generateEdgeId('A', 'B', false);
      expect(edgeId).toBe('A-B');
      
      service.releaseEdgeId(edgeId);
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
    });

    it('should release numbered edge IDs', () => {
      service.generateEdgeId('A', 'B', false); // A-B
      const edgeId2 = service.generateEdgeId('A', 'B', false); // A-B#2
      
      service.releaseEdgeId(edgeId2);
      expect(service.getEdgeCount('A', 'B', false)).toBe(1);
    });

    it('should handle releasing multiple edges', () => {
      const edge1 = service.generateEdgeId('A', 'B', false); // A-B
      const edge2 = service.generateEdgeId('A', 'B', false); // A-B#2
      const edge3 = service.generateEdgeId('A', 'B', false); // A-B#3
      
      service.releaseEdgeId(edge2);
      expect(service.getEdgeCount('A', 'B', false)).toBe(2);
      
      service.releaseEdgeId(edge1);
      expect(service.getEdgeCount('A', 'B', false)).toBe(1);
      
      service.releaseEdgeId(edge3);
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
    });

    it('should not go below zero when releasing non-existent edges', () => {
      service.releaseEdgeId('A-B');
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
      
      service.releaseEdgeId('A-B#5');
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
    });

    it('should handle releasing in undirected graphs with normalized keys', () => {
      service.generateEdgeId('A', 'B', false); // A-B
      service.generateEdgeId('B', 'A', false); // A-B#2
      
      service.releaseEdgeId('A-B');
      expect(service.getEdgeCount('A', 'B', false)).toBe(1);
      expect(service.getEdgeCount('B', 'A', false)).toBe(1); // Same as A-B in undirected
    });

    it('should handle releasing in directed graphs', () => {
      service.generateEdgeId('A', 'B', true); // A-B
      service.generateEdgeId('B', 'A', true); // B-A
      
      service.releaseEdgeId('A-B');
      expect(service.getEdgeCount('A', 'B', true)).toBe(0);
      expect(service.getEdgeCount('B', 'A', true)).toBe(1);
    });
  });

  describe('getEdgeCount', () => {
    it('should return 0 for non-existent edges', () => {
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
      expect(service.getEdgeCount('A', 'B', true)).toBe(0);
    });

    it('should return correct count for undirected edges', () => {
      service.generateEdgeId('A', 'B', false);
      expect(service.getEdgeCount('A', 'B', false)).toBe(1);
      expect(service.getEdgeCount('B', 'A', false)).toBe(1); // Same edge in undirected
      
      service.generateEdgeId('A', 'B', false);
      expect(service.getEdgeCount('A', 'B', false)).toBe(2);
    });

    it('should return correct count for directed edges', () => {
      service.generateEdgeId('A', 'B', true);
      expect(service.getEdgeCount('A', 'B', true)).toBe(1);
      expect(service.getEdgeCount('B', 'A', true)).toBe(0); // Different direction
      
      service.generateEdgeId('B', 'A', true);
      expect(service.getEdgeCount('A', 'B', true)).toBe(1);
      expect(service.getEdgeCount('B', 'A', true)).toBe(1);
    });

    it('should handle self-loops correctly', () => {
      service.generateEdgeId('A', 'A', false);
      service.generateEdgeId('A', 'A', false);
      
      expect(service.getEdgeCount('A', 'A', false)).toBe(2);
    });
  });

  describe('reset', () => {
    it('should clear all edge counters', () => {
      service.generateEdgeId('A', 'B', false);
      service.generateEdgeId('C', 'D', true);
      service.generateEdgeId('A', 'B', false);
      
      expect(service.getEdgeCount('A', 'B', false)).toBe(2);
      expect(service.getEdgeCount('C', 'D', true)).toBe(1);
      
      service.reset();
      
      expect(service.getEdgeCount('A', 'B', false)).toBe(0);
      expect(service.getEdgeCount('C', 'D', true)).toBe(0);
    });

    it('should allow regenerating same edge IDs after reset', () => {
      const edge1 = service.generateEdgeId('A', 'B', false);
      const edge2 = service.generateEdgeId('A', 'B', false);
      
      expect(edge1).toBe('A-B');
      expect(edge2).toBe('A-B#2');
      
      service.reset();
      
      const newEdge1 = service.generateEdgeId('A', 'B', false);
      const newEdge2 = service.generateEdgeId('A', 'B', false);
      
      expect(newEdge1).toBe('A-B');
      expect(newEdge2).toBe('A-B#2');
    });
  });

  describe('Edge cases', () => {
    it('should handle numeric vertex IDs', () => {
      expect(service.generateEdgeId('1', '2', false)).toBe('1-2');
      expect(service.generateEdgeId('2', '1', false)).toBe('1-2#2');
    });

    it('should handle mixed alphanumeric vertex IDs', () => {
      expect(service.generateEdgeId('A1', 'B2', false)).toBe('A1-B2');
      expect(service.generateEdgeId('B2', 'A1', false)).toBe('A1-B2#2');
    });

    it('should handle vertex IDs with special characters', () => {
      expect(service.generateEdgeId('A_1', 'B_2', false)).toBe('A_1-B_2');
      expect(service.generateEdgeId('node1', 'node2', true)).toBe('node1-node2');
    });

    it('should handle very long vertex IDs', () => {
      const longId1 = 'VERY_LONG_VERTEX_ID_1';
      const longId2 = 'VERY_LONG_VERTEX_ID_2';
      
      expect(service.generateEdgeId(longId1, longId2, false))
        .toBe('VERY_LONG_VERTEX_ID_1-VERY_LONG_VERTEX_ID_2');
    });
  });
});
