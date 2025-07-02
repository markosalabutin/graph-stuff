import React, { useState } from 'react';
import styles from './GraphOptions.module.css';

interface GraphOptionsProps {
  isDirected: boolean;
  onDirectedChange: (isDirected: boolean) => void;
  isWeighted: boolean;
  onWeightedChange: (isWeighted: boolean) => void;
  onGenerateCompleteGraph: (n: number) => void;
}

export const GraphOptions: React.FC<GraphOptionsProps> = ({
  isDirected,
  onDirectedChange,
  isWeighted,
  onWeightedChange,
  onGenerateCompleteGraph
}) => {
  const [vertexCount, setVertexCount] = useState<string>('5');

  const handleGenerateComplete = () => {
    const n = parseInt(vertexCount, 10);
    if (isNaN(n) || n < 1 || n > 50) {
      alert('Please enter a number between 1 and 50');
      return;
    }
    onGenerateCompleteGraph(n);
  };

  return (
    <div className={styles.graphOptions}>
      <div className={styles.option}>
        <label className={styles.toggleLabel} title="Press G to toggle">
          <span className={styles.toggleText}>Directed Graph</span>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={isDirected}
              onChange={(e) => onDirectedChange(e.target.checked)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
          </div>
        </label>
      </div>
      <div className={styles.option}>
        <label className={styles.toggleLabel} title="Press W to toggle">
          <span className={styles.toggleText}>Weighted Graph</span>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={isWeighted}
              onChange={(e) => onWeightedChange(e.target.checked)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
          </div>
        </label>
      </div>
      <div className={styles.option}>
        <div className={styles.generateSection}>
          <span className={styles.generateLabel}>Complete Graph:</span>
          <div className={styles.generateControls}>
            <input
              type="number"
              min="1"
              max="50"
              value={vertexCount}
              onChange={(e) => setVertexCount(e.target.value)}
              className={styles.numberInput}
              placeholder="n"
            />
            <button
              onClick={handleGenerateComplete}
              className={styles.generateButton}
              title="Generate complete graph with n vertices"
            >
              Generate K_{vertexCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
