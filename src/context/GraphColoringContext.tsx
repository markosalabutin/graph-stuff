import React from 'react';
import type { ColoringResult } from '../services/GraphColoringService';

export interface GraphColoringContextType {
  coloringResult: ColoringResult | null;
  isActive: boolean;
  setColoringResult: (result: ColoringResult | null) => void;
  setActive: (active: boolean) => void;
  clearColoring: () => void;
}

export const GraphColoringContext = React.createContext<GraphColoringContextType | null>(null);

export const useGraphColoring = (): GraphColoringContextType => {
  const context = React.useContext(GraphColoringContext);
  if (!context) {
    throw new Error('useGraphColoring must be used within a GraphColoringProvider');
  }
  return context;
};
