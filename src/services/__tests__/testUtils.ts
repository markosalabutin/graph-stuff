import { vi } from 'vitest';
import type { GraphAPI } from '../../context/GraphContext';
import type { VertexId, EdgeId, Weight } from '../../domain/Graph';
import type { GraphType } from '../../domain/GraphModel';

/**
 * Creates a mock graph for testing purposes
 * This is a shared utility to ensure consistency across all service tests
 */
export const createMockGraph = (
  vertices: VertexId[],
  edges: Array<{
    id?: EdgeId;
    source: VertexId;
    target: VertexId;
    weight: Weight;
  }>,
  graphType: GraphType = 'directed'
): GraphAPI => {
  const edgesWithIds = edges.map((edge, index) => ({
    id: edge.id || `e${index}`,
    source: edge.source,
    target: edge.target,
    weight: edge.weight,
  }));

  return {
    getVertices: () => vertices,
    getEdges: () => edgesWithIds,
    getGraphType: () => graphType,
    addVertex: vi.fn(),
    getVertex: vi.fn(),
    addEdge: vi.fn(),
    setEdgeWeight: vi.fn(),
    removeVertex: vi.fn(),
    removeEdge: vi.fn(),
    transitionGraphType: vi.fn(),
    resetFromDTO: vi.fn(),
  };
};

/**
 * Creates a mock graph with a more complete implementation for tests that need stateful behavior
 * This is useful for tests that need to actually add/remove vertices and edges
 */
export class MockGraph implements GraphAPI {
  private vertices: VertexId[] = [];
  private edges: Array<{
    id: EdgeId;
    source: VertexId;
    target: VertexId;
    weight: Weight;
  }> = [];
  private graphType: GraphType = 'undirected';

  constructor(
    initialVertices: VertexId[] = [],
    initialEdges: Array<{
      id?: EdgeId;
      source: VertexId;
      target: VertexId;
      weight: Weight;
    }> = [],
    graphType: GraphType = 'undirected'
  ) {
    this.vertices = [...initialVertices];
    this.edges = initialEdges.map((edge, index) => ({
      id: edge.id || `e${index}`,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
    }));
    this.graphType = graphType;
  }

  addVertex(id?: VertexId): VertexId {
    const vertexId = id || `v${this.vertices.length}`;
    this.vertices.push(vertexId);
    return vertexId;
  }

  getVertex(id: VertexId): VertexId | null {
    return this.vertices.includes(id) ? id : null;
  }

  getVertices(): VertexId[] {
    return [...this.vertices];
  }

  getEdges() {
    return [...this.edges];
  }

  addEdge(source: VertexId, target: VertexId, weight: Weight = 1): EdgeId {
    const edgeId = `e${this.edges.length}`;
    this.edges.push({ id: edgeId, source, target, weight });
    return edgeId;
  }

  setEdgeWeight(edgeId: EdgeId, weight: Weight): void {
    const edge = this.edges.find((e) => e.id === edgeId);
    if (edge) {
      edge.weight = weight;
    }
  }

  removeVertex(id: VertexId): void {
    this.vertices = this.vertices.filter((v) => v !== id);
    this.edges = this.edges.filter((e) => e.source !== id && e.target !== id);
  }

  removeEdge(edgeId: EdgeId): void {
    this.edges = this.edges.filter((e) => e.id !== edgeId);
  }

  transitionGraphType(targetType: GraphType): void {
    this.graphType = targetType;
  }

  getGraphType(): GraphType {
    return this.graphType;
  }

  resetFromDTO(): void {
    // Mock implementation - can be customized per test if needed
  }
}
