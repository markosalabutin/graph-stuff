/**
 * Generic Priority Queue implementation using a binary heap
 *
 * Supports both min-heap (default) and max-heap configurations.
 * Elements are prioritized by numerical priority values.
 *
 * Time Complexity:
 * - enqueue: O(log n)
 * - dequeue: O(log n)
 * - peek: O(1)
 * - size: O(1)
 * - isEmpty: O(1)
 *
 * Space Complexity: O(n)
 */

export interface PriorityQueueItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityQueueItem<T>[] = [];
  private compare: (a: number, b: number) => boolean;

  constructor(isMinHeap: boolean = true) {
    this.compare = isMinHeap
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a > b;
  }

  enqueue(item: T, priority: number): void {
    const newItem: PriorityQueueItem<T> = { item, priority };
    this.heap.push(newItem);
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop()!.item;
    }

    const root = this.heap[0].item;
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return root;
  }

  peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0].item : undefined;
  }

  peekPriority(): number | undefined {
    return this.heap.length > 0 ? this.heap[0].priority : undefined;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  toArray(): T[] {
    return this.heap.map((item) => item.item);
  }

  toArrayWithPriorities(): PriorityQueueItem<T>[] {
    return [...this.heap];
  }

  contains(item: T): boolean {
    return this.heap.some((heapItem) => heapItem.item === item);
  }

  updatePriority(item: T, newPriority: number): boolean {
    const index = this.heap.findIndex((heapItem) => heapItem.item === item);

    if (index === -1) {
      this.enqueue(item, newPriority);
      return false;
    }

    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;

    if (this.compare(newPriority, oldPriority)) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }

    return true;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (
        !this.compare(
          this.heap[index].priority,
          this.heap[parentIndex].priority
        )
      ) {
        break;
      }

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let targetIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compare(
          this.heap[leftChild].priority,
          this.heap[targetIndex].priority
        )
      ) {
        targetIndex = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compare(
          this.heap[rightChild].priority,
          this.heap[targetIndex].priority
        )
      ) {
        targetIndex = rightChild;
      }

      if (targetIndex === index) {
        break;
      }

      this.swap(index, targetIndex);
      index = targetIndex;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

export function createMinPriorityQueue<T>(): PriorityQueue<T> {
  return new PriorityQueue<T>(true);
}

export function createMaxPriorityQueue<T>(): PriorityQueue<T> {
  return new PriorityQueue<T>(false);
}
