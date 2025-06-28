import React from 'react';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';
import styles from './ModeSelector.module.css';
import { Mode } from '../constants/modes';
import type { Mode as ModeType } from '../constants/modes';

interface ModeSelectorProps {
  currentMode: ModeType;
  onModeChange: (mode: ModeType) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  currentMode, 
  onModeChange 
}) => {
  const modes: RadioOption<ModeType>[] = [
    { value: Mode.VERTEX, label: 'Vertex', color: '#28a745' },
    { value: Mode.EDGE, label: 'Edge', color: '#17a2b8' },
    { value: Mode.DELETE, label: 'Delete', color: '#dc3545' }
  ];

  return (
    <div 
      className={styles.modeSelector} 
      title="Press V for Vertex, E for Edge, D for Delete, G for Directed/Undirected, W for Weighted/Unweighted"
    >
      <RadioGroup
        options={modes}
        value={currentMode}
        onChange={onModeChange}
        name="mode"
        ariaLabel="Graph editing mode"
        className={styles.transparent}
      />
    </div>
  );
};
