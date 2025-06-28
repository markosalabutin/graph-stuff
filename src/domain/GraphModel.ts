import { MultiGraph } from 'graphology';
import { defaultNamingService as VertexNamingService } from '../services/VertexNamingService';
import { defaultEdgeNamingService as EdgeNamingService } from '../services/EdgeNamingService';
import type { EdgeId, VertexId, Graph, Weight } from './Graph';

export type GraphType = 'directed' | 'undirected';

export const createGraph = (type: GraphType): Graph => {
  VertexNamingService.reset();
  EdgeNamingService.reset();
  return new MultiGraph({ type });
};

export const addVertex = (g: Graph, id?: VertexId): VertexId => {
  let newId: VertexId;

  if (id) {
    if (!VertexNamingService.reserveName(id)) {
      throw new Error(`Vertex with ID '${id}' already exists`);
    }
    newId = id;
  } else {
    newId = VertexNamingService.generateName();
  }

  g.addNode(newId);
  return newId;
};

export const getVertex = (g: Graph, id: VertexId): VertexId | null => {
  return g.hasNode(id) ? id : null;
};

export const getVertices = (g: Graph): VertexId[] => {
  return g.nodes();
};

export const getEdges = (g: Graph): Array<{id: EdgeId, source: VertexId, target: VertexId, weight: Weight}> => {
  return g.mapEdges((edge, attributes, source, target) => ({
    id: edge,
    source,
    target,
    weight: attributes.weight || 1,
  }));
};

export const addEdge = (
  g: Graph,
  source: VertexId,
  target: VertexId,
  weight: Weight = 1
): EdgeId => {
  const isDirected = g.type === 'directed';
  const edgeId = EdgeNamingService.generateEdgeId(source, target, isDirected);
  g.addEdgeWithKey(edgeId, source, target, { weight });
  return edgeId;
};

export const updateEdgeWeight = (
  g: Graph,
  edgeKey: EdgeId,
  weight: Weight
): void => {
  g.setEdgeAttribute(edgeKey, 'weight', weight);
};

export const removeVertex = (g: Graph, id: VertexId): void => {
  if (g.hasNode(id)) {
    g.dropNode(id);
    VertexNamingService.releaseName(id);
  }
};

export const removeEdge = (g: Graph, edgeId: EdgeId): void => {
  if (g.hasEdge(edgeId)) {
    g.dropEdge(edgeId);
    EdgeNamingService.releaseEdgeId(edgeId);
  }
};
