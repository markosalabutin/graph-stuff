import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGraph } from '../context/GraphContext';
import { useMSTContext } from '../context/MSTContext';
import { useVisualizationMode } from '../context/VisualizationModeContext';
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
  const { activeMode, setActiveMode } = useVisualizationMode();
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<MSTAlgorithm>('kruskal');

  const isAccordionOpen = activeMode === 'mst';

  const mstResult = useMemo(() => {
    if (!isAccordionOpen) return null;

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
  }, [graph, selectedAlgorithm, isWeighted, isAccordionOpen]);

  const handleAlgorithmChange = useCallback((algorithm: MSTAlgorithm) => {
    setSelectedAlgorithm(algorithm);
  }, []);

  const handleAccordionToggle = useCallback(
    (isOpen: boolean) => {
      setActiveMode(isOpen ? 'mst' : 'none');

      setMSTVisualizationActive(isOpen);

      if (!isOpen) {
        setMstEdgeIds(new Set());
      } else if (mstResult?.success) {
        const mstEdgeIds = new Set(
          mstResult.result.edges.map((edge) => edge.id)
        );
        setMstEdgeIds(mstEdgeIds);
      }
    },
    [setMSTVisualizationActive, setMstEdgeIds, mstResult, setActiveMode]
  );

  useEffect(() => {
    if (isAccordionOpen && mstResult?.success) {
      const mstEdgeIds = new Set(mstResult.result.edges.map((edge) => edge.id));
      setMstEdgeIds(mstEdgeIds);
    } else {
      setMstEdgeIds(new Set());
    }
  }, [mstResult, isAccordionOpen, setMstEdgeIds]);

  useEffect(() => {
    if (activeMode !== 'mst') {
      setMSTVisualizationActive(false);
      setMstEdgeIds(new Set());
    }
  }, [activeMode, setMSTVisualizationActive, setMstEdgeIds]);

  const algorithms: RadioOption<MSTAlgorithm>[] = [
    { value: 'kruskal' as const, label: 'Kruskal', color: '#6f42c1' },
    { value: 'prim' as const, label: 'Prim', color: '#17a2b8' },
  ];

  const renderMSTResult = () => {
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
    <Accordion
      title="Minimum Spanning Tree"
      className={styles.mstAccordion}
      isExpanded={isAccordionOpen}
      onToggle={handleAccordionToggle}
    >
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

      {renderMSTResult()}
    </Accordion>
  );
};
