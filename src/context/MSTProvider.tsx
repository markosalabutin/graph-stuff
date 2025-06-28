import React, { type ReactNode, useState, useCallback } from 'react';
import { type MSTContextValue, MSTContext } from './MSTContext';

interface MSTProviderProps {
  children: ReactNode;
}

export const MSTProvider: React.FC<MSTProviderProps> = ({ children }) => {
  const [mstEdgeIds, setMstEdgeIds] = useState<Set<string>>(new Set());
  const [isMSTVisualizationActive, setIsMSTVisualizationActive] = useState(false);

  const updateMstEdgeIds = useCallback((edgeIds: Set<string>) => {
    setMstEdgeIds(edgeIds);
  }, []);

  const updateMSTVisualizationActive = useCallback((active: boolean) => {
    setIsMSTVisualizationActive(active);
  }, []);

  const value: MSTContextValue = {
    mstEdgeIds,
    isMSTVisualizationActive,
    setMstEdgeIds: updateMstEdgeIds,
    setMSTVisualizationActive: updateMSTVisualizationActive
  };

  return (
    <MSTContext.Provider value={value}>
      {children}
    </MSTContext.Provider>
  );
};
