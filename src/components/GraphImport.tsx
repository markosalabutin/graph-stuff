import React, { useRef } from 'react';
import styles from './GraphImport.module.css';

interface GraphImportProps {
  onImport: (file: File) => void;
}

export const GraphImport: React.FC<GraphImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      onImport(file);
    } else if (file) {
      alert('Please select a valid JSON file.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.importContainer}>
      <button 
        className={styles.importButton}
        onClick={handleButtonClick}
        title="Import graph from JSON file"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </div>
  );
};
