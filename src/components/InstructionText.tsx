import React from 'react';
import type { Mode as ModeType } from '../constants/modes';

interface EdgeCreationState {
  sourceVertex: string | null;
}

interface InstructionTextProps {
  currentMode: ModeType;
  edgeCreationState: EdgeCreationState;
  isWeighted: boolean;
}

export const InstructionText: React.FC<InstructionTextProps> = ({
  currentMode,
  edgeCreationState,
  isWeighted,
}) => {
  if (currentMode === 'vertex') {
    return (
      <>
        Vertex mode: Click to add • Drag to move
      </>
    );
  }

  if (currentMode === 'delete') {
    return <>Delete mode: Click vertex or edge to delete</>;
  }

  if (edgeCreationState.sourceVertex) {
    const weightHint = isWeighted ? ' (weight will be prompted)' : '';
    return (
      <>
        Creating edge from {edgeCreationState.sourceVertex} - click target
        vertex{weightHint} or ESC to cancel
      </>
    );
  }

  const weightHint = isWeighted
    ? ' • Weight will be prompted for each edge'
    : '';
  return (
    <>
      Edge mode: Click first vertex to start edge{weightHint}
    </>
  );
};
