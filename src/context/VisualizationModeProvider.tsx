import React, { useState, useCallback, useMemo } from 'react';
import { VisualizationModeContext, type VisualizationMode } from './VisualizationModeContext';

interface VisualizationModeProviderProps {
  children: React.ReactNode;
}

export const VisualizationModeProvider: React.FC<VisualizationModeProviderProps> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<VisualizationMode>('none');

  const handleSetActiveMode = useCallback((mode: VisualizationMode) => {
    setActiveMode(mode);
  }, []);

  const contextValue = useMemo(() => ({
    activeMode,
    setActiveMode: handleSetActiveMode,
  }), [activeMode, handleSetActiveMode]);

  return (
    <VisualizationModeContext.Provider value={contextValue}>
      {children}
    </VisualizationModeContext.Provider>
  );
};
