import { createContext, useContext } from 'react';

export type VisualizationMode = 'none' | 'mst' | 'shortest-path' | 'apsp';

export interface VisualizationModeContextType {
  activeMode: VisualizationMode;
  setActiveMode: (mode: VisualizationMode) => void;
}

export const VisualizationModeContext = createContext<VisualizationModeContextType | null>(null);

export const useVisualizationMode = (): VisualizationModeContextType => {
  const context = useContext(VisualizationModeContext);
  if (!context) {
    throw new Error('useVisualizationMode must be used within VisualizationModeProvider');
  }
  return context;
};
