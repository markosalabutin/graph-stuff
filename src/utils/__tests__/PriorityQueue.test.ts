import { describe, it, expect } from 'vitest';
import { PriorityQueue, createMinPriorityQueue, createMaxPriorityQueue } from '../PriorityQueue';

describe('PriorityQueue', () => {
  describe('Min Heap (Default)', () => {
    it('should create empty queue', () => {
      const pq = new PriorityQueue<string>();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
      expect(pq.peek()).toBeUndefined();
      expect(pq.dequeue()).toBeUndefined();
    });

    it('should enqueue and dequeue single item', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 5);

      expect(pq.size()).toBe(1);
      expect(pq.isEmpty()).toBe(false);
      expect(pq.peek()).toBe('A');
      expect(pq.peekPriority()).toBe(5);
      expect(pq.dequeue()).toBe('A');
      expect(pq.isEmpty()).toBe(true);
    });

    it('should maintain min-heap property', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('C', 30);
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('D', 5);

      expect(pq.dequeue()).toBe('D'); // priority 5
      expect(pq.dequeue()).toBe('A'); // priority 10
      expect(pq.dequeue()).toBe('B'); // priority 20
      expect(pq.dequeue()).toBe('C'); // priority 30
    });

    it('should handle equal priorities', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 10);
      pq.enqueue('C', 5);

      expect(pq.dequeue()).toBe('C'); // priority 5
      // A and B both have priority 10, either could come first
      const next = pq.dequeue();
      expect(['A', 'B']).toContain(next);
    });
  });

  describe('Max Heap', () => {
    it('should maintain max-heap property', () => {
      const pq = new PriorityQueue<string>(false);
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('C', 30);
      pq.enqueue('D', 5);

      expect(pq.dequeue()).toBe('C'); // priority 30
      expect(pq.dequeue()).toBe('B'); // priority 20
      expect(pq.dequeue()).toBe('A'); // priority 10
      expect(pq.dequeue()).toBe('D'); // priority 5
    });
  });

  describe('Utility Functions', () => {
    it('should create min priority queue correctly', () => {
      const pq = createMinPriorityQueue<number>();
      pq.enqueue(100, 3);
      pq.enqueue(200, 1);
      pq.enqueue(300, 2);

      expect(pq.dequeue()).toBe(200); // lowest priority first
    });

    it('should create max priority queue correctly', () => {
      const pq = createMaxPriorityQueue<number>();
      pq.enqueue(100, 3);
      pq.enqueue(200, 1);
      pq.enqueue(300, 2);

      expect(pq.dequeue()).toBe(100); // highest priority first
    });
  });

  describe('Advanced Operations', () => {
    it('should update priority correctly (increase)', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('C', 30);

      const updated = pq.updatePriority('C', 5);
      expect(updated).toBe(true);
      expect(pq.dequeue()).toBe('C'); // now has priority 5
    });

    it('should update priority correctly (decrease)', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('C', 5);

      const updated = pq.updatePriority('C', 25);
      expect(updated).toBe(true);
      expect(pq.dequeue()).toBe('A'); // C now has priority 25
    });

    it('should add new item when updating non-existent item', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);

      const updated = pq.updatePriority('B', 5);
      expect(updated).toBe(false);
      expect(pq.size()).toBe(2);
      expect(pq.dequeue()).toBe('B'); // priority 5
    });

    it('should check contains correctly', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);

      expect(pq.contains('A')).toBe(true);
      expect(pq.contains('C')).toBe(false);
    });

    it('should clear queue correctly', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);

      pq.clear();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should convert to array correctly', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('C', 5);

      const items = pq.toArray();
      expect(items).toHaveLength(3);
      expect(items).toContain('A');
      expect(items).toContain('B');
      expect(items).toContain('C');
    });

    it('should convert to array with priorities correctly', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);

      const items = pq.toArrayWithPriorities();
      expect(items).toHaveLength(2);
      expect(items.some(item => item.item === 'A' && item.priority === 10)).toBe(true);
      expect(items.some(item => item.item === 'B' && item.priority === 20)).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle large number of items', () => {
      const pq = new PriorityQueue<number>();
      const items = Array.from({ length: 1000 }, (_, i) => i);
      
      // Add items in random order
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      shuffled.forEach(item => pq.enqueue(item, item));

      // Should dequeue in sorted order
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.dequeue()!);
      }

      expect(result).toEqual(items);
    });

    it('should handle duplicate priorities correctly', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 10);
      pq.enqueue('B', 10);
      pq.enqueue('C', 10);
      pq.enqueue('D', 5);

      expect(pq.dequeue()).toBe('D'); // priority 5
      
      // The rest have same priority, should maintain some order
      const remaining = [pq.dequeue(), pq.dequeue(), pq.dequeue()];
      expect(remaining).toHaveLength(3);
      expect(remaining).toContain('A');
      expect(remaining).toContain('B');
      expect(remaining).toContain('C');
    });

    it('should maintain heap property after multiple operations', () => {
      const pq = new PriorityQueue<string>();
      
      // Add some items
      pq.enqueue('A', 10);
      pq.enqueue('B', 20);
      pq.enqueue('C', 5);
      
      // Remove minimum
      expect(pq.dequeue()).toBe('C');
      
      // Add more items
      pq.enqueue('D', 3);
      pq.enqueue('E', 15);
      
      // Check order is still maintained
      expect(pq.dequeue()).toBe('D'); // priority 3
      expect(pq.dequeue()).toBe('A'); // priority 10
      expect(pq.dequeue()).toBe('E'); // priority 15
      expect(pq.dequeue()).toBe('B'); // priority 20
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative priorities', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', -10);
      pq.enqueue('B', -5);
      pq.enqueue('C', 0);

      expect(pq.dequeue()).toBe('A'); // priority -10
      expect(pq.dequeue()).toBe('B'); // priority -5
      expect(pq.dequeue()).toBe('C'); // priority 0
    });

    it('should handle floating point priorities', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('A', 1.5);
      pq.enqueue('B', 1.2);
      pq.enqueue('C', 1.8);

      expect(pq.dequeue()).toBe('B'); // priority 1.2
      expect(pq.dequeue()).toBe('A'); // priority 1.5
      expect(pq.dequeue()).toBe('C'); // priority 1.8
    });

    it('should handle object items', () => {
      interface Item {
        id: string;
        value: number;
      }

      const pq = new PriorityQueue<Item>();
      const item1 = { id: 'A', value: 100 };
      const item2 = { id: 'B', value: 200 };

      pq.enqueue(item1, 20);
      pq.enqueue(item2, 10);

      expect(pq.dequeue()).toBe(item2);
      expect(pq.dequeue()).toBe(item1);
    });
  });
});
