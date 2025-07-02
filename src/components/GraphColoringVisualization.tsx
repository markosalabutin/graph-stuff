import React, { useCallback, useEffect } from 'react';
import { useGraph } from '../context/GraphContext';
import { useGraphColoring } from '../context/GraphColoringContext';
import { useVisualizationMode } from '../context/VisualizationModeContext';
import { GraphColoringService } from '../services/GraphColoringService';
import { COLOR_PALETTE } from '../constants/colorPalette';
import { Accordion } from './Accordion';
import styles from './GraphColoringVisualization.module.css';

export const GraphColoringVisualization: React.FC = () => {
  const graph = useGraph();
  const {
    coloringResult,
    isActive,
    setColoringResult,
    setActive,
    clearColoring,
  } = useGraphColoring();
  const { activeMode, setActiveMode } = useVisualizationMode();

  const isAccordionOpen = activeMode === 'coloring';

  const computeColoring = useCallback(() => {
    try {
      const result = GraphColoringService.colorGraph(graph);
      setColoringResult(result);
    } catch (error) {
      console.error('Error computing graph coloring:', error);
      setColoringResult(null);
    }
  }, [graph, setColoringResult]);

  const handleVisualizationToggle = useCallback(
    (open: boolean) => {
      setActiveMode(open ? 'coloring' : 'none');
      setActive(open);

      if (open) {
        computeColoring();
      } else {
        clearColoring();
      }
    },
    [setActiveMode, setActive, computeColoring, clearColoring]
  );

  useEffect(() => {
    if (isActive) {
      computeColoring();
    }
  }, [isActive, computeColoring]);

  // Automatically turn off coloring when accordion closes (due to other mode activation)
  useEffect(() => {
    if (activeMode !== 'coloring' && isActive) {
      setActive(false);
      clearColoring();
    }
  }, [activeMode, isActive, setActive, clearColoring]);

  const vertices = graph.getVertices();
  const bounds =
    vertices.length > 0 ? GraphColoringService.getColoringBounds(graph) : null;

  return (
    <Accordion
      title="Graph Coloring"
      onToggle={handleVisualizationToggle}
      isExpanded={isAccordionOpen}
      className={styles.accordion}
    >
      <div className={styles.container}>
        {vertices.length === 0 ? (
          <div className={styles.info}>
            Add vertices to compute graph coloring
          </div>
        ) : (
          <>
            {bounds && (
              <div className={styles.bounds}>
                <div className={styles.boundsLabel}>Theoretical Bounds:</div>
                <div className={styles.boundsValue}>
                  {bounds.lowerBound} ≤ χ(G) ≤ {bounds.upperBound}
                </div>
              </div>
            )}

            {coloringResult && (
              <div className={styles.results}>
                <div className={styles.colorClasses}>
                  <div className={styles.colorClassesTitle}>Color Classes:</div>
                  <div className={styles.colorClassesList}>
                    {coloringResult.colorClasses.map((colorClass, index) => (
                      <div key={index} className={styles.colorClass}>
                        <div
                          className={styles.colorIndicator}
                          style={{
                            backgroundColor:
                              COLOR_PALETTE[index % COLOR_PALETTE.length],
                          }}
                        />
                        <div className={styles.colorVertices}>
                          {colorClass.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Accordion>
  );
};
