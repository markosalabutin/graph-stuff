import { type ReactNode, useRef, useReducer } from 'react';
import {
  createGraph,
  addVertex,
  addEdge,
  updateEdgeWeight,
  removeVertex,
  removeEdge,
  getVertex,
  getVertices,
  getEdges,
  type GraphType,
} from '../domain/GraphModel';
import { transitionGraphType } from '../services/GraphTransitionService';
import { type GraphAPI, GraphCtx } from './GraphContext';
import type { VertexId, EdgeId, Graph, Weight } from '../domain/Graph';

export function GraphProvider({ children }: { children: ReactNode }) {
  const graphRef = useRef<Graph>(null);
  if (!graphRef.current) {
    graphRef.current = createGraph('undirected');
  }
  const graph = graphRef.current!;

  const [, bump] = useReducer((x) => x + 1, 0);

  const api: GraphAPI = {
    addVertex(id?: VertexId) {
      const node = addVertex(graph, id);
      bump();
      return node;
    },
    getVertex(id: VertexId) {
      return getVertex(graph, id);
    },
    getVertices() {
      return getVertices(graph);
    },
    getEdges() {
      return getEdges(graph);
    },
    addEdge(src: VertexId, tgt: VertexId, w: Weight = 1) {
      const key = addEdge(graph, src, tgt, w);
      bump();
      return key;
    },
    setEdgeWeight(key: EdgeId, w: Weight) {
      updateEdgeWeight(graph, key, w);
      bump();
    },
    removeVertex(id: VertexId) {
      removeVertex(graph, id);
      bump();
    },
    removeEdge(key: EdgeId) {
      removeEdge(graph, key);
      bump();
    },
    transitionGraphType(targetType: GraphType) {
      const result = transitionGraphType(graph, targetType);
      graphRef.current = result.newGraph;
      bump();
    },
    getGraphType() {
      return graph.type as GraphType;
    },
  };

  return <GraphCtx.Provider value={api}>{children}</GraphCtx.Provider>;
}
