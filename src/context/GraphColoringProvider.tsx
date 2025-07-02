import React, { useState, useCallback } from 'react';
import { GraphColoringContext } from './GraphColoringContext';
import type { ColoringResult } from '../services/GraphColoringService';

interface GraphColoringProviderProps {
  children: React.ReactNode;
}

export const GraphColoringProvider: React.FC<GraphColoringProviderProps> = ({ children }) => {
  const [coloringResult, setColoringResultState] = useState<ColoringResult | null>(null);
  const [isActive, setActiveState] = useState(false);

  const setColoringResult = useCallback((result: ColoringResult | null) => {
    setColoringResultState(result);
  }, []);

  const setActive = useCallback((active: boolean) => {
    setActiveState(active);
    if (!active) {
      setColoringResultState(null);
    }
  }, []);

  const clearColoring = useCallback(() => {
    setColoringResultState(null);
  }, []);

  const value = {
    coloringResult,
    isActive,
    setColoringResult,
    setActive,
    clearColoring,
  };

  return (
    <GraphColoringContext.Provider value={value}>
      {children}
    </GraphColoringContext.Provider>
  );
};
