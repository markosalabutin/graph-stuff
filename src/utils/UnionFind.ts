/**
 * Union-Find (Disjoint Set Union) data structure
 * 
 * Supports efficient union and find operations with path compression
 * and union by rank optimizations.
 * 
 * Time Complexity:
 * - find: O(α(n)) amortized, where α is the inverse Ackermann function
 * - union: O(α(n)) amortized
 * - Space: O(n)
 */
export class UnionFind<T> {
  private parent: Map<T, T> = new Map();
  private rank: Map<T, number> = new Map();
  private componentCount: number = 0;

  constructor(elements: T[]) {
    for (const element of elements) {
      this.parent.set(element, element);
      this.rank.set(element, 0);
    }
    this.componentCount = elements.length;
  }

  find(element: T): T {
    const parent = this.parent.get(element);
    if (parent === undefined) {
      throw new Error(`Element ${element} not found in Union-Find structure`);
    }

    if (parent !== element) {
      this.parent.set(element, this.find(parent));
    }
    return this.parent.get(element)!;
  }

  union(element1: T, element2: T): boolean {
    const root1 = this.find(element1);
    const root2 = this.find(element2);

    if (root1 === root2) {
      return false;
    }

    const rank1 = this.rank.get(root1)!;
    const rank2 = this.rank.get(root2)!;

    if (rank1 < rank2) {
      this.parent.set(root1, root2);
    } else if (rank1 > rank2) {
      this.parent.set(root2, root1);
    } else {
      this.parent.set(root2, root1);
      this.rank.set(root1, rank1 + 1);
    }

    this.componentCount--;
    return true;
  }

  isConnected(element1: T, element2: T): boolean {
    return this.find(element1) === this.find(element2);
  }

  getComponentCount(): number {
    return this.componentCount;
  }

  getComponent(element: T): T[] {
    const root = this.find(element);
    const component: T[] = [];
    
    for (const [elem] of this.parent) {
      if (this.find(elem) === root) {
        component.push(elem);
      }
    }
    
    return component;
  }

  getAllComponents(): T[][] {
    const components = new Map<T, T[]>();
    
    for (const [element] of this.parent) {
      const root = this.find(element);
      if (!components.has(root)) {
        components.set(root, []);
      }
      components.get(root)!.push(element);
    }
    
    return Array.from(components.values());
  }

  contains(element: T): boolean {
    return this.parent.has(element);
  }

  getComponentSize(element: T): number {
    return this.getComponent(element).length;
  }
}
