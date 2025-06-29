import { createContext, useContext } from 'react';
import type { VertexId } from '../domain/Graph';
import type { ShortestPathAlgorithm, ShortestPathResult, ShortestPathError } from '../services/ShortestPathService';

export interface ShortestPathState {
  algorithm: ShortestPathAlgorithm;
  sourceVertex: VertexId | null;
  targetVertex: VertexId | null;
  result: ShortestPathResult | null;
  error: ShortestPathError | null;
  isVisualizationActive: boolean;
}

export interface ShortestPathActions {
  setAlgorithm: (algorithm: ShortestPathAlgorithm) => void;
  setSourceVertex: (vertex: VertexId | null) => void;
  setTargetVertex: (vertex: VertexId | null) => void;
  setResult: (result: ShortestPathResult | null) => void;
  setError: (error: ShortestPathError | null) => void;
  setVisualizationActive: (active: boolean) => void;
  clearPath: () => void;
}

export interface ShortestPathContextType {
  state: ShortestPathState;
  actions: ShortestPathActions;
}

export const ShortestPathContext = createContext<ShortestPathContextType | null>(null);

export const useShortestPath = (): ShortestPathContextType => {
  const context = useContext(ShortestPathContext);
  if (!context) {
    throw new Error('useShortestPath must be used within ShortestPathProvider');
  }
  return context;
};
