import React from 'react';
import type { VertexId, Weight, EdgeId } from '../domain/Graph';
import type { GraphType } from '../domain/GraphModel';
import type { GraphDTO } from '../domain/GraphDTO';

export interface GraphAPI {
  addVertex: (id?: VertexId) => VertexId;
  getVertex: (id: VertexId) => VertexId | null;
  getVertices: () => VertexId[];
  getEdges: () => Array<{
    id: EdgeId;
    source: VertexId;
    target: VertexId;
    weight: Weight;
  }>;
  addEdge: (source: VertexId, target: VertexId, weight?: Weight) => EdgeId;
  setEdgeWeight: (edgeId: EdgeId, weight: Weight) => void;
  removeVertex: (id: VertexId) => void;
  removeEdge: (edgeId: EdgeId) => void;
  transitionGraphType: (targetType: GraphType) => void;
  getGraphType: () => GraphType;
  resetFromDTO: (graphDTO: GraphDTO) => void;
}

export const GraphCtx = React.createContext<GraphAPI | null>(null);

export const useGraph = (): GraphAPI => {
  const context = React.useContext(GraphCtx);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};
