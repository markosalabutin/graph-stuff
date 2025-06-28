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
      }}
    >
      {id}
    </div>
  );
};
