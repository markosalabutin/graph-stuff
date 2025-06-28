import { useEffect } from 'react';
import { Mode } from '../constants/modes';
import type { Mode as ModeType } from '../constants/modes';

interface KeyboardShortcutsConfig {
  currentMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  onGraphTypeChange: (isDirected: boolean) => void;
  onWeightedChange: (isWeighted: boolean) => void;
  onEscapeEdgeCreation: () => void;
  isDirected: boolean;
  isWeighted: boolean;
}

export const useKeyboardShortcuts = ({
  currentMode,
  onModeChange,
  onGraphTypeChange,
  onWeightedChange,
  onEscapeEdgeCreation,
  isDirected,
  isWeighted,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case 'e':
          event.preventDefault();
          onModeChange(Mode.EDGE);
          break;
        case 'v':
          event.preventDefault();
          onModeChange(Mode.VERTEX);
          break;
        case 'd':
          event.preventDefault();
          onModeChange(Mode.DELETE);
          break;
        case 'g':
          event.preventDefault();
          onGraphTypeChange(!isDirected);
          break;
        case 'w':
          event.preventDefault();
          onWeightedChange(!isWeighted);
          break;
        case 'escape':
          event.preventDefault();
          if (currentMode === Mode.EDGE) {
            onEscapeEdgeCreation();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    currentMode,
    onModeChange,
    onGraphTypeChange,
    onWeightedChange,
    onEscapeEdgeCreation,
    isDirected,
    isWeighted,
  ]);
};
