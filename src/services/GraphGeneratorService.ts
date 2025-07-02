import type { VertexId } from '../domain/Graph';
import type { GraphAPI } from '../context/GraphContext';

export const generateCompleteGraph = (
  graph: GraphAPI,
  n: number,
  positions: Record<VertexId, { x: number; y: number }>,
  setPositions: (positions: Record<VertexId, { x: number; y: number }>) => void
): VertexId[] => {
  if (n < 1 || n > 50) {
    throw new Error('Number of vertices must be between 1 and 50');
  }

  const vertices: VertexId[] = [];
  const newPositions = { ...positions };

  const centerX = 700;
  const centerY = 500;
  const radius = Math.min(150 + n * 3, 250);

  for (let i = 0; i < n; i++) {
    const vertexId = graph.addVertex();
    vertices.push(vertexId);

    const angle = (2 * Math.PI * i) / n;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    newPositions[vertexId] = { x, y };
  }

  const isDirected = graph.getGraphType() === 'directed';
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      graph.addEdge(vertices[i], vertices[j], 1);
      
      if (isDirected) {
        graph.addEdge(vertices[j], vertices[i], 1);
      }
    }
  }

  setPositions(newPositions);

  return vertices;
};
