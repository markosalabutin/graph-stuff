import { describe, it, expect } from 'vitest';
import { UnionFind } from '../UnionFind';

describe('UnionFind', () => {
  describe('Basic Operations', () => {
    it('should initialize with individual components', () => {
      const elements = ['A', 'B', 'C', 'D'];
      const uf = new UnionFind(elements);

      expect(uf.getComponentCount()).toBe(4);
      expect(uf.find('A')).toBe('A');
      expect(uf.find('B')).toBe('B');
      expect(uf.isConnected('A', 'B')).toBe(false);
    });

    it('should union two elements correctly', () => {
      const elements = ['A', 'B', 'C'];
      const uf = new UnionFind(elements);

      const result = uf.union('A', 'B');
      expect(result).toBe(true);
      expect(uf.isConnected('A', 'B')).toBe(true);
      expect(uf.getComponentCount()).toBe(2);
    });

    it('should return false when unioning already connected elements', () => {
      const elements = ['A', 'B', 'C'];
      const uf = new UnionFind(elements);

      uf.union('A', 'B');
      const result = uf.union('A', 'B');
      expect(result).toBe(false);
      expect(uf.getComponentCount()).toBe(2);
    });

    it('should handle transitive connections', () => {
      const elements = ['A', 'B', 'C', 'D'];
      const uf = new UnionFind(elements);

      uf.union('A', 'B');
      uf.union('B', 'C');

      expect(uf.isConnected('A', 'C')).toBe(true);
      expect(uf.isConnected('A', 'D')).toBe(false);
      expect(uf.getComponentCount()).toBe(2);
    });
  });

  describe('Path Compression', () => {
    it('should optimize paths through compression', () => {
      const elements = ['A', 'B', 'C', 'D', 'E'];
      const uf = new UnionFind(elements);

      // Create a chain: A -> B -> C -> D
      uf.union('A', 'B');
      uf.union('B', 'C');
      uf.union('C', 'D');

      // After find operations, paths should be compressed
      const rootA = uf.find('A');
      const rootD = uf.find('D');
      expect(rootA).toBe(rootD);
      expect(uf.isConnected('A', 'D')).toBe(true);
    });
  });

  describe('Component Operations', () => {
    it('should get component correctly', () => {
      const elements = ['A', 'B', 'C', 'D', 'E'];
      const uf = new UnionFind(elements);

      uf.union('A', 'B');
      uf.union('B', 'C');
      uf.union('D', 'E');

      const componentA = uf.getComponent('A');
      const componentD = uf.getComponent('D');

      expect(componentA).toHaveLength(3);
      expect(componentA).toContain('A');
      expect(componentA).toContain('B');
      expect(componentA).toContain('C');

      expect(componentD).toHaveLength(2);
      expect(componentD).toContain('D');
      expect(componentD).toContain('E');
    });

    it('should get all components correctly', () => {
      const elements = ['A', 'B', 'C', 'D'];
      const uf = new UnionFind(elements);

      uf.union('A', 'B');
      uf.union('C', 'D');

      const allComponents = uf.getAllComponents();
      expect(allComponents).toHaveLength(2);
      
      const sizes = allComponents.map(comp => comp.length).sort();
      expect(sizes).toEqual([2, 2]);
    });

    it('should get component size correctly', () => {
      const elements = ['A', 'B', 'C', 'D'];
      const uf = new UnionFind(elements);

      uf.union('A', 'B');
      uf.union('B', 'C');

      expect(uf.getComponentSize('A')).toBe(3);
      expect(uf.getComponentSize('B')).toBe(3);
      expect(uf.getComponentSize('C')).toBe(3);
      expect(uf.getComponentSize('D')).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initialization', () => {
      const uf = new UnionFind<string>([]);
      expect(uf.getComponentCount()).toBe(0);
      expect(uf.getAllComponents()).toEqual([]);
    });

    it('should handle single element', () => {
      const uf = new UnionFind(['A']);
      expect(uf.getComponentCount()).toBe(1);
      expect(uf.find('A')).toBe('A');
      expect(uf.getComponent('A')).toEqual(['A']);
    });

    it('should throw error for non-existent element', () => {
      const uf = new UnionFind(['A', 'B']);
      expect(() => uf.find('C')).toThrow('Element C not found');
    });

    it('should check contains correctly', () => {
      const uf = new UnionFind(['A', 'B']);
      expect(uf.contains('A')).toBe(true);
      expect(uf.contains('C')).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle star graph formation', () => {
      const elements = ['center', 'A', 'B', 'C', 'D'];
      const uf = new UnionFind(elements);

      // Connect all to center
      uf.union('center', 'A');
      uf.union('center', 'B');
      uf.union('center', 'C');
      uf.union('center', 'D');

      expect(uf.getComponentCount()).toBe(1);
      expect(uf.isConnected('A', 'D')).toBe(true);
      expect(uf.getComponentSize('center')).toBe(5);
    });

    it('should handle merging large components', () => {
      const elements = Array.from({ length: 10 }, (_, i) => i.toString());
      const uf = new UnionFind(elements);

      // Create two components: [0,1,2,3,4] and [5,6,7,8,9]
      for (let i = 0; i < 4; i++) {
        uf.union(i.toString(), (i + 1).toString());
      }
      for (let i = 5; i < 9; i++) {
        uf.union(i.toString(), (i + 1).toString());
      }

      expect(uf.getComponentCount()).toBe(2);
      
      // Merge the components
      uf.union('4', '5');
      expect(uf.getComponentCount()).toBe(1);
      expect(uf.isConnected('0', '9')).toBe(true);
    });
  });

  describe('Numeric Types', () => {
    it('should work with numbers', () => {
      const elements = [1, 2, 3, 4, 5];
      const uf = new UnionFind(elements);

      uf.union(1, 2);
      uf.union(3, 4);
      uf.union(2, 3);

      expect(uf.isConnected(1, 4)).toBe(true);
      expect(uf.isConnected(1, 5)).toBe(false);
      expect(uf.getComponentCount()).toBe(2);
    });
  });
});
