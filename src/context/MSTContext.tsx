import { createContext, useContext } from 'react';

export interface MSTContextValue {
  mstEdgeIds: Set<string>;
  isMSTVisualizationActive: boolean;
  setMstEdgeIds: (edgeIds: Set<string>) => void;
  setMSTVisualizationActive: (active: boolean) => void;
}

export const MSTContext = createContext<MSTContextValue | undefined>(undefined);

export const useMSTContext = (): MSTContextValue => {
  const context = useContext(MSTContext);
  if (!context) {
    throw new Error('useMSTContext must be used within a MSTProvider');
  }
  return context;
};
