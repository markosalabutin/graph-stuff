import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { Mode } from '../../constants/modes';

describe('useKeyboardShortcuts', () => {
  const mockHandlers = {
    onModeChange: vi.fn(),
    onGraphTypeChange: vi.fn(),
    onWeightedChange: vi.fn(),
    onEscapeEdgeCreation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle mode change shortcuts', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'v' });
    expect(mockHandlers.onModeChange).toHaveBeenCalledWith(Mode.VERTEX);

    fireEvent.keyDown(document, { key: 'e' });
    expect(mockHandlers.onModeChange).toHaveBeenCalledWith(Mode.EDGE);

    fireEvent.keyDown(document, { key: 'd' });
    expect(mockHandlers.onModeChange).toHaveBeenCalledWith(Mode.DELETE);
  });

  it('should handle graph type and weight shortcuts', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'g' });
    expect(mockHandlers.onGraphTypeChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(document, { key: 'w' });
    expect(mockHandlers.onWeightedChange).toHaveBeenCalledWith(true);
  });

  it('should handle escape key in edge mode', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.EDGE,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockHandlers.onEscapeEdgeCreation).toHaveBeenCalled();
  });

  it('should not handle escape key in non-edge modes', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockHandlers.onEscapeEdgeCreation).not.toHaveBeenCalled();
  });

  it('should be case insensitive', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'V' });
    expect(mockHandlers.onModeChange).toHaveBeenCalledWith(Mode.VERTEX);

    fireEvent.keyDown(document, { key: 'G' });
    expect(mockHandlers.onGraphTypeChange).toHaveBeenCalledWith(true);
  });

  it('should ignore keys when typing in input fields', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'v' });

    expect(mockHandlers.onModeChange).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should ignore keys when typing in textarea fields', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: false,
        isWeighted: false,
        ...mockHandlers,
      })
    );

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    fireEvent.keyDown(textarea, { key: 'e' });

    expect(mockHandlers.onModeChange).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should toggle states correctly based on current values', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        currentMode: Mode.VERTEX,
        isDirected: true,
        isWeighted: true,
        ...mockHandlers,
      })
    );

    fireEvent.keyDown(document, { key: 'g' });
    expect(mockHandlers.onGraphTypeChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(document, { key: 'w' });
    expect(mockHandlers.onWeightedChange).toHaveBeenCalledWith(false);
  });
});
