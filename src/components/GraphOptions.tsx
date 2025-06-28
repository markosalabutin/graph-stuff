import React from 'react';
import styles from './GraphOptions.module.css';

interface GraphOptionsProps {
  isDirected: boolean;
  onDirectedChange: (isDirected: boolean) => void;
  isWeighted: boolean;
  onWeightedChange: (isWeighted: boolean) => void;
}

export const GraphOptions: React.FC<GraphOptionsProps> = ({
  isDirected,
  onDirectedChange,
  isWeighted,
  onWeightedChange
}) => {
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
    </div>
  );
};
