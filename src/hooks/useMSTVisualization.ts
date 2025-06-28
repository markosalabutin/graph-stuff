import { useState, useCallback } from 'react';

export interface MSTVisualizationState {
  mstEdgeIds: Set<string>;
  isVisualizationActive: boolean;
  setMstEdgeIds: (edgeIds: Set<string>) => void;
  setIsVisualizationActive: (active: boolean) => void;
}

export const useMSTVisualization = (): MSTVisualizationState => {
  const [mstEdgeIds, setMstEdgeIds] = useState<Set<string>>(new Set());
  const [isVisualizationActive, setIsVisualizationActive] = useState(false);

  const updateMstEdgeIds = useCallback((edgeIds: Set<string>) => {
    setMstEdgeIds(edgeIds);
  }, []);

  const updateVisualizationActive = useCallback((active: boolean) => {
    setIsVisualizationActive(active);
  }, []);

  return {
    mstEdgeIds,
    isVisualizationActive,
    setMstEdgeIds: updateMstEdgeIds,
    setIsVisualizationActive: updateVisualizationActive
  };
};
