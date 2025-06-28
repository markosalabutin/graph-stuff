import { createGraph, addVertex, addEdge, getVertices, getEdges } from '../domain/GraphModel';
import type { Graph, VertexId, EdgeId, Weight } from '../domain/Graph';
import type { GraphType } from '../domain/GraphModel';

export interface GraphTransitionResult {
  newGraph: Graph;
  vertexMapping: Record<VertexId, VertexId>;
  edgeMapping: Record<EdgeId, EdgeId[]>;
}

export const transitionGraphType = (
  currentGraph: Graph,
  targetType: GraphType
): GraphTransitionResult => {
  const currentType = currentGraph.type as GraphType;
  
  if (currentType === targetType) {
    const vertices = getVertices(currentGraph);
    const edges = getEdges(currentGraph);
    
    return {
      newGraph: currentGraph,
      vertexMapping: Object.fromEntries(vertices.map(v => [v, v])),
      edgeMapping: Object.fromEntries(edges.map(e => [e.id, [e.id]])),
    };
  }

  const newGraph = createGraph(targetType);
  const vertexMapping: Record<VertexId, VertexId> = {};
  const edgeMapping: Record<EdgeId, EdgeId[]> = {};

  const currentVertices = getVertices(currentGraph);
  for (const oldVertexId of currentVertices) {
    const newVertexId = addVertex(newGraph, oldVertexId);
    vertexMapping[oldVertexId] = newVertexId;
  }

  const currentEdges = getEdges(currentGraph);
  
  if (currentType === 'undirected' && targetType === 'directed') {
    transitionUndirectedToDirected(newGraph, currentEdges, edgeMapping);
  } else if (currentType === 'directed' && targetType === 'undirected') {
    transitionDirectedToUndirected(newGraph, currentEdges, edgeMapping);
  }

  return {
    newGraph,
    vertexMapping,
    edgeMapping,
  };
};

const transitionUndirectedToDirected = (
  newGraph: Graph,
  currentEdges: Array<{id: EdgeId, source: VertexId, target: VertexId, weight: Weight}>,
  edgeMapping: Record<EdgeId, EdgeId[]>
): void => {
  for (const edge of currentEdges) {
    const { id: oldEdgeId, source, target, weight } = edge;
    
    const edgeId1 = addEdge(newGraph, source, target, weight);
    const edgeId2 = addEdge(newGraph, target, source, weight);
    
    edgeMapping[oldEdgeId] = [edgeId1, edgeId2];
  }
};

const transitionDirectedToUndirected = (
  newGraph: Graph,
  currentEdges: Array<{id: EdgeId, source: VertexId, target: VertexId, weight: Weight}>,
  edgeMapping: Record<EdgeId, EdgeId[]>
): void => {
  const processedPairs = new Set<string>();
  
  for (const edge of currentEdges) {
    const { id: oldEdgeId, source, target, weight } = edge;
    
    const canonicalPair = source < target ? `${source}-${target}` : `${target}-${source}`;
    
    if (processedPairs.has(canonicalPair)) {
      const existingEdge = getEdges(newGraph).find(e => 
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
      );
      
      if (existingEdge) {
        edgeMapping[oldEdgeId] = [existingEdge.id];
      }
      continue;
    }
    
    processedPairs.add(canonicalPair);
    
    const newEdgeId = addEdge(newGraph, source, target, weight);
    edgeMapping[oldEdgeId] = [newEdgeId];
    
    const reverseEdge = currentEdges.find(e => 
      e.source === target && e.target === source && e.id !== oldEdgeId
    );
    
    if (reverseEdge) {
      edgeMapping[reverseEdge.id] = [newEdgeId];
    }
  }
};
