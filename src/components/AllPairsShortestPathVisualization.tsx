import React, { useState, useCallback, useMemo } from 'react';
import { useGraph } from '../context/GraphContext';
import { useVisualizationMode } from '../context/VisualizationModeContext';
import { AllPairsShortestPathService, type AllPairsAlgorithm } from '../services/AllPairsShortestPathService';
import { Accordion } from './Accordion';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';
import styles from './AllPairsShortestPathVisualization.module.css';

const algorithmOptions: RadioOption<AllPairsAlgorithm>[] = [
  { value: 'floyd-warshall', label: 'Floyd-Warshall', color: '#6f42c1' },
  { value: 'johnson', label: 'Johnson', color: '#17a2b8' },
];

interface AllPairsShortestPathVisualizationProps {
  isWeighted: boolean;
}

export const AllPairsShortestPathVisualization: React.FC<AllPairsShortestPathVisualizationProps> = ({
  isWeighted,
}) => {
  const graph = useGraph();
  const { activeMode, setActiveMode } = useVisualizationMode();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AllPairsAlgorithm>('floyd-warshall');

  const isAccordionOpen = activeMode === 'apsp';

  const apspResult = useMemo(() => {
    if (!isAccordionOpen) return null;

    try {
      return AllPairsShortestPathService.computeAllPairsShortestPaths(
        graph,
        selectedAlgorithm,
        isWeighted
      );
    } catch {
      return {
        type: 'validation' as const,
        message: 'Failed to compute all-pairs shortest paths',
      };
    }
  }, [graph, selectedAlgorithm, isWeighted, isAccordionOpen]);

  const handleAlgorithmChange = useCallback((algorithm: AllPairsAlgorithm) => {
    setSelectedAlgorithm(algorithm);
  }, []);

  const handleAccordionToggle = useCallback(
    (isOpen: boolean) => {
      setActiveMode(isOpen ? 'apsp' : 'none');
    },
    [setActiveMode]
  );

  const renderDistanceMatrix = () => {
    if (!apspResult || 'type' in apspResult) return null;

    const vertices = graph.getVertices();
    const { distances } = apspResult;

    return (
      <div className={styles.matrixContainer}>
        <h4 className={styles.matrixTitle}>Distance Matrix</h4>
        <div className={styles.tableWrapper}>
          <table className={styles.distanceTable}>
            <thead>
              <tr>
                <th className={styles.cornerHeader}>From\To</th>
                {vertices.map(vertex => (
                  <th key={vertex} className={styles.columnHeader}>
                    {vertex}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vertices.map(fromVertex => (
                <tr key={fromVertex}>
                  <th className={styles.rowHeader}>{fromVertex}</th>
                  {vertices.map(toVertex => {
                    const distance = distances.get(fromVertex)?.get(toVertex);
                    const isFinite = distance !== undefined && distance !== Infinity;
                    
                    return (
                      <td 
                        key={toVertex} 
                        className={`${styles.distanceCell} ${
                          fromVertex === toVertex ? styles.diagonalCell : ''
                        } ${isFinite ? styles.finiteDistance : styles.infiniteDistance}`}
                      >
                        {fromVertex === toVertex 
                          ? '0' 
                          : isFinite 
                            ? distance.toString()
                            : '∞'
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAPSPResult = () => {
    if (!apspResult) return null;

    if ('type' in apspResult) {
      return (
        <div className={styles.errorMessage}>
          <strong>Cannot compute all-pairs shortest paths:</strong>
          <br />
          {apspResult.message}
        </div>
      );
    }

    const vertices = graph.getVertices();
    const finiteDistances = Array.from(apspResult.distances.entries())
      .flatMap(([from, distances]) => 
        Array.from(distances.entries())
          .filter(([to, distance]) => from !== to && distance !== Infinity)
      );

    return (
      <div className={styles.apspInfo}>
        <div className={styles.apspStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Algorithm:</span>
            <span className={styles.statValue}>
              {apspResult.algorithm === 'floyd-warshall' ? 'Floyd-Warshall' : 'Johnson'}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Vertices:</span>
            <span className={styles.statValue}>{vertices.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Reachable Pairs:</span>
            <span className={styles.statValue}>{finiteDistances.length}</span>
          </div>
        </div>
        
        {renderDistanceMatrix()}
      </div>
    );
  };

  const hasResult = apspResult && !('type' in apspResult);

  return (
    <Accordion
      title="All-Pairs Shortest Paths"
      className={hasResult ? styles.apspAccordionExpanded : styles.apspAccordion}
      isExpanded={isAccordionOpen}
      onToggle={handleAccordionToggle}
    >
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Algorithm</h4>
        <div className={styles.algorithmToggle}>
          <RadioGroup
            options={algorithmOptions}
            value={selectedAlgorithm}
            onChange={handleAlgorithmChange}
            name="apsp-algorithm"
            ariaLabel="All-Pairs Shortest Path Algorithm"
            variant="full-width"
          />
        </div>
      </div>

      {renderAPSPResult()}
    </Accordion>
  );
};
