import React from 'react';
import styles from './Edge.module.css';
import { EDGE_THICKNESS, VERTEX_RADIUS } from '../constants/graphConstants';
import type { EdgeId, Weight } from '../domain/Graph';

interface EdgeProps {
  id?: EdgeId;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  weight?: Weight;
  isPreview?: boolean;
  isInDeleteMode?: boolean;
  isDirected?: boolean;
  isWeighted?: boolean;
  isMSTEdge?: boolean;
  isMSTVisualizationActive?: boolean;
  isShortestPathEdge?: boolean;
  isShortestPathVisualizationActive?: boolean;
  onEdgeClick?: (edgeId: EdgeId) => void;
  onWeightClick?: (edgeId: EdgeId, currentWeight: Weight) => void;
}

export const Edge: React.FC<EdgeProps> = ({
  id,
  startX,
  startY,
  endX,
  endY,
  weight = 1,
  isPreview = false,
  isInDeleteMode = false,
  isDirected = false,
  isWeighted = false,
  isMSTEdge = false,
  isMSTVisualizationActive = false,
  isShortestPathEdge = false,
  isShortestPathVisualizationActive = false,
  onEdgeClick,
  onWeightClick,
}) => {
  // Check if this is a self-loop
  const isSelfLoop = startX === endX && startY === endY;

  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowOffset = 20;

  const adjustedEndX = endX - arrowOffset * Math.cos(angle);
  const adjustedEndY = endY - arrowOffset * Math.sin(angle);

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const handleClick = (e: React.MouseEvent) => {
    if (isInDeleteMode && id && onEdgeClick) {
      e.stopPropagation();
      onEdgeClick(id);
    }
  };

  const handleWeightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onWeightClick) {
      onWeightClick(id, weight);
    }
  };

  const getEdgeClass = () => {
    let edgeClass = styles.edge;

    if (isPreview) {
      edgeClass += ` ${styles.preview}`;
    } else {
      edgeClass += ` ${styles.normal}`;
    }

    if (isInDeleteMode) {
      edgeClass += ` ${styles.deletable}`;
    }

    if (isMSTVisualizationActive) {
      if (isMSTEdge) {
        edgeClass += ` ${styles.mstEdge}`;
      } else {
        edgeClass += ` ${styles.nonMstEdge}`;
      }
    }

    if (isShortestPathVisualizationActive) {
      if (isShortestPathEdge) {
        edgeClass += ` ${styles.shortestPathEdge}`;
      } else {
        edgeClass += ` ${styles.nonShortestPathEdge}`;
      }
    }

    return edgeClass;
  };

  return (
    <>
      <svg
        key={id}
        className={getEdgeClass()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        onClick={handleClick}
      >
        {isDirected && (
          <defs>
            <marker
              id={`arrowhead-${id || 'preview'}`}
              markerWidth="6"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 6 2.5, 0 5" className={styles.arrowhead} />
            </marker>
            <marker
              id={`arrowhead-selfloop-${id || 'preview'}`}
              markerWidth="6"
              markerHeight="5"
              viewBox="0 0 12 10"
              refX="6"
              refY="5"
              orient="auto"
            >
              <g transform="rotate(270 6 5) translate(0, 0)">
                <polygon
                  points="3 2.5, 9 5, 3 7.5"
                  className={styles.arrowhead}
                />
              </g>
            </marker>
          </defs>
        )}

        {isSelfLoop ? (
          <circle
            cx={startX + 20}
            cy={startY - VERTEX_RADIUS}
            r={20}
            fill="none"
            strokeWidth={EDGE_THICKNESS}
            className={styles.line}
            style={{ pointerEvents: 'stroke' }}
          />
        ) : (
          <line
            x1={startX}
            y1={startY}
            x2={isDirected ? adjustedEndX : endX}
            y2={isDirected ? adjustedEndY : endY}
            strokeWidth={EDGE_THICKNESS}
            className={styles.line}
            markerEnd={
              isDirected ? `url(#arrowhead-${id || 'preview'})` : undefined
            }
            style={{ pointerEvents: 'stroke' }}
          />
        )}
        {isWeighted && !isPreview && (
          <g
            onClick={handleWeightClick}
            className={onWeightClick ? styles.weightClickable : ''}
            style={{
              cursor: onWeightClick ? 'pointer' : 'default',
            }}
          >
            <circle
              cx={isSelfLoop ? startX : midX}
              cy={isSelfLoop ? startY - 40 : midY}
              r="12"
              className={styles.weightBackground}
              style={{
                pointerEvents: onWeightClick ? 'all' : 'none',
              }}
            />
            <text
              x={isSelfLoop ? startX : midX}
              y={isSelfLoop ? startY - 40 : midY}
              className={styles.weightLabel}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                pointerEvents: onWeightClick ? 'all' : 'none',
              }}
            >
              {weight}
            </text>
          </g>
        )}
      </svg>

      {isSelfLoop && isDirected && (
        <div
          className={styles.selfLoopArrow}
          style={{
            left: startX - 6,
            top: startY - VERTEX_RADIUS - 10,
            transform: 'rotate(0deg)',
          }}
        />
      )}
    </>
  );
};
