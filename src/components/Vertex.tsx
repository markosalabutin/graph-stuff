import React from 'react';
import styles from './Vertex.module.css';
import { VERTEX_RADIUS } from '../constants/graphConstants';
import type { VertexId } from '../domain/Graph';

interface VertexProps {
  id: VertexId;
  x: number;
  y: number;
  isDragging: boolean;
  isSourceVertex: boolean;
  isHoveredTarget: boolean;
  isInDeleteMode?: boolean;
  isShortestPathSource?: boolean;
  isShortestPathTarget?: boolean;
  isShortestPathVertex?: boolean;
  isShortestPathVisualizationActive?: boolean;
  isColoringActive?: boolean;
  coloringColor?: string;
  onMouseDown: (event: React.MouseEvent, vertexId: VertexId) => void;
  onMouseEnter: (vertexId: VertexId) => void;
  onMouseLeave: () => void;
}

export const Vertex: React.FC<VertexProps> = ({
  id,
  x,
  y,
  isDragging,
  isSourceVertex,
  isHoveredTarget,
  isInDeleteMode = false,
  isShortestPathSource = false,
  isShortestPathTarget = false,
  isShortestPathVertex = false,
  isShortestPathVisualizationActive = false,
  coloringColor,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const getVertexClass = () => {
    let vertexClass = styles.vertex;
    
    if (isDragging) {
      vertexClass += ` ${styles.dragging}`;
    } else if (isSourceVertex) {
      vertexClass += ` ${styles.sourceVertex}`;
    } else if (isHoveredTarget) {
      vertexClass += ` ${styles.hoveredTarget}`;
    } else {
      vertexClass += ` ${styles.normal}`;
    }

    // Add delete mode class for hover styling, but don't change base color
    if (isInDeleteMode) {
      vertexClass += ` ${styles.deletable}`;
    }

    // Add shortest path visualization classes
    if (isShortestPathVisualizationActive) {
      if (isShortestPathSource) {
        vertexClass += ` ${styles.shortestPathSource}`;
      } else if (isShortestPathTarget) {
        vertexClass += ` ${styles.shortestPathTarget}`;
      } else if (isShortestPathVertex) {
        vertexClass += ` ${styles.shortestPathVertex}`;
      } else {
        vertexClass += ` ${styles.nonShortestPathVertex}`;
      }
    }
    
    return vertexClass;
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, id)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={onMouseLeave}
      className={getVertexClass()}
      style={{
        left: x - VERTEX_RADIUS,
        top: y - VERTEX_RADIUS,
        ...(coloringColor && {
          backgroundColor: coloringColor,
          borderColor: coloringColor,
        }),
      }}
    >
      {id}
    </div>
  );
};
