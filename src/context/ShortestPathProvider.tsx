import React, { useState, useCallback, useMemo } from 'react';
import type { VertexId } from '../domain/Graph';
import type { ShortestPathAlgorithm, ShortestPathResult, ShortestPathError } from '../services/ShortestPathService';
import { ShortestPathContext, type ShortestPathState, type ShortestPathActions } from './ShortestPathContext';

interface ShortestPathProviderProps {
  children: React.ReactNode;
}

export const ShortestPathProvider: React.FC<ShortestPathProviderProps> = ({ children }) => {
  const [algorithm, setAlgorithm] = useState<ShortestPathAlgorithm>('dijkstra');
  const [sourceVertex, setSourceVertex] = useState<VertexId | null>(null);
  const [targetVertex, setTargetVertex] = useState<VertexId | null>(null);
  const [result, setResult] = useState<ShortestPathResult | null>(null);
  const [error, setError] = useState<ShortestPathError | null>(null);
  const [isVisualizationActive, setVisualizationActive] = useState<boolean>(false);

  const clearPath = useCallback(() => {
    setSourceVertex(null);
    setTargetVertex(null);
    setResult(null);
    setError(null);
  }, []);

  const state: ShortestPathState = useMemo(() => ({
    algorithm,
    sourceVertex,
    targetVertex,
    result,
    error,
    isVisualizationActive,
  }), [algorithm, sourceVertex, targetVertex, result, error, isVisualizationActive]);

  const actions: ShortestPathActions = useMemo(() => ({
    setAlgorithm,
    setSourceVertex,
    setTargetVertex,
    setResult,
    setError,
    setVisualizationActive,
    clearPath,
  }), [clearPath]);

  const contextValue = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <ShortestPathContext.Provider value={contextValue}>
      {children}
    </ShortestPathContext.Provider>
  );
};
