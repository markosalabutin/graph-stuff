import React from 'react';
import styles from './ModeToggle.module.css';
import { Mode } from '../constants/modes';
import type { Mode as ModeType } from '../constants/modes';

interface ModeToggleProps {
  currentMode: ModeType;
  onModeChange: (mode: ModeType) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onModeChange }) => {
  const handleModeChange = (mode: ModeType) => {
    onModeChange(mode);
  };

  const modes = [
    { value: Mode.VERTEX, label: 'Vertex', color: '#28a745' },
    { value: Mode.EDGE, label: 'Edge', color: '#17a2b8' },
    { value: Mode.DELETE, label: 'Delete', color: '#dc3545' }
  ];

  return (
    <div className={styles.modeToggle} title="Press V for Vertex, E for Edge, D for Delete, G for Directed/Undirected, W for Weighted/Unweighted">
      <div className={styles.radioGroup} role="radiogroup" aria-label="Graph editing mode">
        {modes.map((mode) => (
          <label key={mode.value} className={styles.radioOption}>
            <input
              type="radio"
              name="mode"
              value={mode.value}
              checked={currentMode === mode.value}
              onChange={() => handleModeChange(mode.value)}
              className={styles.radioInput}
              aria-label={`${mode.label} mode`}
            />
            <span 
              className={`${styles.radioLabel} ${currentMode === mode.value ? styles.active : ''}`}
              style={{ '--mode-color': mode.color } as React.CSSProperties}
            >
              {mode.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
