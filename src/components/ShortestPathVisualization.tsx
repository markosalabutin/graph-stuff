import React, { useEffect } from 'react';
import { useGraph } from '../context/GraphContext';
import { useShortestPath } from '../context/ShortestPathContext';
import { useVisualizationMode } from '../context/VisualizationModeContext';
import { ShortestPathService, type ShortestPathAlgorithm } from '../services/ShortestPathService';
import { Accordion } from './Accordion';
import { RadioGroup } from './RadioGroup';
import styles from './ShortestPathVisualization.module.css';

const algorithmOptions = [
  { value: 'dijkstra', label: 'Dijkstra', color: '#6f42c1' },
  { value: 'bellman-ford', label: 'Bellman-Ford', color: '#17a2b8' }
];

interface ShortestPathVisualizationProps {
  isWeighted: boolean;
}

export const ShortestPathVisualization: React.FC<ShortestPathVisualizationProps> = ({
  isWeighted
}) => {
  const graph = useGraph();
  const { state, actions } = useShortestPath();
  const { activeMode, setActiveMode } = useVisualizationMode();

  const isAccordionOpen = activeMode === 'shortest-path';

  useEffect(() => {
    if (!state.sourceVertex || !state.targetVertex) {
      return;
    }

    actions.setError(null);
    actions.setResult(null);

    try {
      const result = ShortestPathService.computeShortestPath(
        graph,
        state.sourceVertex,
        state.targetVertex,
        state.algorithm,
        isWeighted
      );

      if ('type' in result) {
        actions.setError(result);
        actions.setResult(null);
      } else {
        actions.setResult(result);
        actions.setError(null);
      }
    } catch (error) {
      actions.setError({
        type: 'validation',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [state.sourceVertex, state.targetVertex, state.algorithm, graph, actions, isWeighted]);

  useEffect(() => {
    if (activeMode !== 'shortest-path' && state.isVisualizationActive) {
      actions.setVisualizationActive(false);
      actions.clearPath();
    }
  }, [activeMode, state.isVisualizationActive, actions]);

  // Handle ESC key to clear path when shortest path visualization is active
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAccordionOpen && (state.sourceVertex || state.targetVertex || state.result)) {
        actions.clearPath();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccordionOpen, state.sourceVertex, state.targetVertex, state.result, actions]);

  const handleAlgorithmChange = (algorithm: string) => {
    actions.setAlgorithm(algorithm as ShortestPathAlgorithm);
  };

  const handleClearPath = () => {
    actions.clearPath();
  };

  const handleVisualizationToggle = (isActive: boolean) => {
    setActiveMode(isActive ? 'shortest-path' : 'none');
    
    actions.setVisualizationActive(isActive);
    if (!isActive) {
      actions.clearPath();
    }
  };

  const renderContent = () => {
    const vertices = graph.getVertices();

    if (vertices.length < 2) {
      return (
        <div className={styles.errorMessage}>
          <strong>Cannot compute shortest path:</strong>
          <br />
          Need at least 2 vertices
        </div>
      );
    }

    return (
      <>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Algorithm</h4>
          <div className={styles.algorithmToggle}>
            <RadioGroup
              options={algorithmOptions}
              value={state.algorithm}
              onChange={handleAlgorithmChange}
              name="shortest-path-algorithm"
              ariaLabel="Shortest Path Algorithm"
              variant="full-width"
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.vertexSelection}>
            <div className={styles.vertexGroup}>
              <label className={styles.vertexLabel}>Source:</label>
              <select
                value={state.sourceVertex || ''}
                onChange={(e) => actions.setSourceVertex(e.target.value || null)}
                className={styles.vertexSelect}
                title="Hold 'S' key and click vertices in graph for quick selection"
              >
                <option value=""></option>
                {vertices.map(vertex => (
                  <option key={vertex} value={vertex}>{vertex}</option>
                ))}
              </select>
            </div>

            <div className={styles.vertexGroup}>
              <label className={styles.vertexLabel}>Target:</label>
              <select
                value={state.targetVertex || ''}
                onChange={(e) => actions.setTargetVertex(e.target.value || null)}
                className={styles.vertexSelect}
                title="Hold 'S' key and click vertices in graph for quick selection"
              >
                <option value=""></option>
                {vertices
                  .filter(vertex => vertex !== state.sourceVertex)
                  .map(vertex => (
                    <option key={vertex} value={vertex}>{vertex}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {state.error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {state.error.message}
          </div>
        )}

        {state.result && (
          <div className={styles.pathInfo}>
            <div className={styles.pathStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Algorithm:</span>
                <span className={styles.statValue}>
                  {state.algorithm.charAt(0).toUpperCase() + state.algorithm.slice(1)}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Path Length:</span>
                <span className={styles.statValue}>{state.result.path.length} vertices</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Distance:</span>
                <span className={styles.statValue}>{state.result.totalDistance}</span>
              </div>
            </div>
            <div className={styles.pathDisplay}>
              <div className={styles.pathLabel}>Path:</div>
              <div className={styles.pathSequence}>{state.result.path.join(' → ')}</div>
            </div>
            <div className={styles.colorLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.colorBox} ${styles.sourceColor}`}></div>
                <span>Source</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.colorBox} ${styles.targetColor}`}></div>
                <span>Target</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.colorBox} ${styles.pathElementsColor}`}></div>
                <span>Shortest Path</span>
              </div>
            </div>
          </div>
        )}

        {(state.sourceVertex || state.targetVertex || state.result) && (
          <div className={styles.section}>
            <button
              onClick={handleClearPath}
              className={styles.clearButton}
            >
              Clear Path
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <Accordion 
      title="Shortest Path" 
      className={styles.shortestPathAccordion}
      isExpanded={isAccordionOpen}
      onToggle={handleVisualizationToggle}
    >
      {renderContent()}
    </Accordion>
  );
};
