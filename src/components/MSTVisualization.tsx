import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGraph } from '../context/GraphContext';
import { useMSTContext } from '../context/MSTContext';
import { computeMST } from '../services/MinimumSpanningTreeService';
import { Accordion } from './Accordion';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';
import styles from './MSTVisualization.module.css';

type MSTAlgorithm = 'kruskal' | 'prim';

interface MSTVisualizationProps {
  isWeighted: boolean;
}

export const MSTVisualization: React.FC<MSTVisualizationProps> = ({
  isWeighted,
}) => {
  const graph = useGraph();
  const { setMstEdgeIds, setMSTVisualizationActive } = useMSTContext();
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<MSTAlgorithm>('kruskal');
  const [showMSTColors, setShowMSTColors] = useState(false);

  const mstResult = useMemo(() => {
    if (!showMSTColors) return null;

    try {
      const mockGraph = {
        ...graph,
        getEdges: () => {
          const edges = graph.getEdges();
          return edges.map((edge) => ({
            ...edge,
            weight: isWeighted ? edge.weight : 1,
          }));
        },
      };

      return computeMST(mockGraph, selectedAlgorithm);
    } catch {
      return {
        success: false as const,
        error: {
          type: 'not_connected' as const,
          message: 'Failed to compute MST',
        },
      };
    }
  }, [graph, selectedAlgorithm, showMSTColors, isWeighted]);

  const handleAlgorithmChange = useCallback((algorithm: MSTAlgorithm) => {
    setSelectedAlgorithm(algorithm);
  }, []);

  const handleMSTToggle = useCallback(
    (enabled: boolean) => {
      setShowMSTColors(enabled);
      setMSTVisualizationActive(enabled);

      if (enabled && mstResult?.success) {
        const mstEdgeIds = new Set(
          mstResult.result.edges.map((edge) => edge.id)
        );
        setMstEdgeIds(mstEdgeIds);
      } else {
        setMstEdgeIds(new Set());
      }
    },
    [setMSTVisualizationActive, setMstEdgeIds, mstResult]
  );

  useEffect(() => {
    if (showMSTColors && mstResult?.success) {
      const mstEdgeIds = new Set(mstResult.result.edges.map((edge) => edge.id));
      setMstEdgeIds(mstEdgeIds);
    } else {
      setMstEdgeIds(new Set());
    }
  }, [mstResult, showMSTColors, setMstEdgeIds]);

  const algorithms: RadioOption<MSTAlgorithm>[] = [
    { value: 'kruskal' as const, label: 'Kruskal', color: '#6f42c1' },
    { value: 'prim' as const, label: 'Prim', color: '#17a2b8' },
  ];

  const renderMSTResult = () => {
    if (!showMSTColors) return null;

    if (!mstResult) return null;

    if (!mstResult.success) {
      const error = mstResult.error;
      return (
        <div className={styles.errorMessage}>
          <strong>Cannot compute MST:</strong>
          <br />
          {error.type === 'directed_graph' && 'Graph must be undirected'}
          {error.type === 'insufficient_vertices' && 'Need at least 2 vertices'}
          {error.type === 'not_connected' && 'Graph must be connected'}
          {error.type === 'not_weighted' && 'All edges must have weights'}
        </div>
      );
    }

    const result = mstResult.result;
    return (
      <div className={styles.mstInfo}>
        <div className={styles.mstStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Algorithm:</span>
            <span className={styles.statValue}>
              {result.algorithm.charAt(0).toUpperCase() +
                result.algorithm.slice(1)}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>MST Edges:</span>
            <span className={styles.statValue}>{result.edges.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Weight:</span>
            <span className={styles.statValue}>{result.totalWeight}</span>
          </div>
        </div>
        <div className={styles.colorLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.mstColor}`}></div>
            <span>MST Edges</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.nonMstColor}`}></div>
            <span>Unused Edges</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Accordion title="Minimum Spanning Tree" className={styles.mstAccordion}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Algorithm</h4>
        <div className={styles.algorithmToggle}>
          <RadioGroup
            options={algorithms}
            value={selectedAlgorithm}
            onChange={handleAlgorithmChange}
            name="mst-algorithm"
            ariaLabel="MST Algorithm"
            variant="full-width"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Visualization</h4>
        <label className={styles.toggleLabel}>
          <span className={styles.toggleText}>Show MST Colors</span>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={showMSTColors}
              onChange={(e) => handleMSTToggle(e.target.checked)}
              className={styles.toggleInput}
              aria-label="Show MST edge colors"
            />
            <span className={styles.toggleSlider}></span>
          </div>
        </label>
      </div>

      {renderMSTResult()}
    </Accordion>
  );
};
