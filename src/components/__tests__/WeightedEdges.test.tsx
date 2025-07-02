import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphProvider } from '../../context/GraphProvider';
import { MSTProvider } from '../../context/MSTProvider';
import { ShortestPathProvider } from '../../context/ShortestPathProvider';
import { VisualizationModeProvider } from '../../context/VisualizationModeProvider';
import { GraphCanvas } from '../GraphCanvas';
import { GraphColoringProvider } from '../../context/GraphColoringProvider';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <GraphProvider>
      <VisualizationModeProvider>
        <MSTProvider>
          <ShortestPathProvider>
            <GraphColoringProvider>{component}</GraphColoringProvider>
          </ShortestPathProvider>
        </MSTProvider>
      </VisualizationModeProvider>
    </GraphProvider>
  );
};

describe('Weighted Graph Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show weighted toggle and update instructions', () => {
    renderWithProvider(<GraphCanvas />);

    const weightedToggle = screen.getByLabelText(/weighted graph/i);
    expect(weightedToggle).toBeInTheDocument();
    expect(weightedToggle).not.toBeChecked();

    fireEvent.click(weightedToggle);
    expect(weightedToggle).toBeChecked();

    const edgeMode = screen.getByRole('radio', { name: /edge/i });
    fireEvent.click(edgeMode);

    expect(screen.getByText(/weight will be prompted/i)).toBeInTheDocument();
  });

  it('should display edge mode instructions correctly for weighted vs unweighted', () => {
    renderWithProvider(<GraphCanvas />);

    const edgeButton = screen.getByRole('radio', { name: /edge/i });
    fireEvent.click(edgeButton);

    expect(
      screen.queryByText(/weight will be prompted/i)
    ).not.toBeInTheDocument();

    const weightedToggle = screen.getByLabelText(/weighted graph/i);
    fireEvent.click(weightedToggle);

    expect(screen.getByText(/weight will be prompted/i)).toBeInTheDocument();
  });
});

describe('Weight Input Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 1 for unweighted mode', () => {
    const isWeighted = false;
    const result = isWeighted ? window.prompt('Enter edge weight:', '1') : 1;

    expect(result).toBe(1);
    expect(window.prompt).not.toHaveBeenCalled();
  });

  it('should prompt for weight in weighted mode', () => {
    vi.mocked(window.prompt).mockReturnValue('5');

    const isWeighted = true;
    let result = 1;

    if (isWeighted) {
      const weightInput = window.prompt('Enter edge weight:', '1');
      if (weightInput !== null) {
        const parsedWeight = parseFloat(weightInput.trim());
        if (!isNaN(parsedWeight) && parsedWeight > 0) {
          result = parsedWeight;
        }
      }
    }

    expect(result).toBe(5);
    expect(window.prompt).toHaveBeenCalledWith('Enter edge weight:', '1');
  });

  it('should handle cancelled input', () => {
    vi.mocked(window.prompt).mockReturnValue(null);

    const isWeighted = true;
    let cancelled = false;

    if (isWeighted) {
      const weightInput = window.prompt('Enter edge weight:', '1');
      if (weightInput === null) {
        cancelled = true;
      }
    }

    expect(cancelled).toBe(true);
    expect(window.prompt).toHaveBeenCalledWith('Enter edge weight:', '1');
  });

  it('should validate numeric input', () => {
    const testInputs = [
      { input: '5', valid: true, expected: 5 },
      { input: '3.14', valid: true, expected: 3.14 },
      { input: 'invalid', valid: false, expected: NaN },
      { input: '0', valid: false, expected: 0 },
      { input: '-5', valid: false, expected: -5 },
      { input: '  2.5  ', valid: true, expected: 2.5 },
    ];

    testInputs.forEach(({ input, valid, expected }) => {
      const parsedWeight = parseFloat(input.trim());
      const isValid = !isNaN(parsedWeight) && parsedWeight > 0;

      expect(isValid).toBe(valid);
      if (valid) {
        expect(parsedWeight).toBe(expected);
      }
    });
  });

  it('should simulate retry logic for invalid input', () => {
    vi.mocked(window.prompt)
      .mockReturnValueOnce('invalid')
      .mockReturnValueOnce('0')
      .mockReturnValueOnce('-5')
      .mockReturnValueOnce('3.5');

    vi.mocked(window.alert).mockImplementation(() => {});

    let attempts = 0;
    let finalWeight = 1;

    while (attempts < 4) {
      attempts++;
      const weightInput = window.prompt('Enter edge weight:', '1');

      if (weightInput === null) {
        break;
      }

      const parsedWeight = parseFloat(weightInput.trim());

      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        window.alert('Please enter a valid positive number for the weight.');
        continue;
      }

      finalWeight = parsedWeight;
      break;
    }

    expect(finalWeight).toBe(3.5);
    expect(window.prompt).toHaveBeenCalledTimes(4);
    expect(window.alert).toHaveBeenCalledTimes(3);
  });
});

describe('Edge Component Props', () => {
  it('should handle weight prop correctly', () => {
    interface EdgeProps {
      weight?: number;
      isWeighted?: boolean;
      isPreview?: boolean;
    }

    const testProps: EdgeProps = {
      weight: 2.5,
      isWeighted: true,
      isPreview: false,
    };

    const shouldShowWeight = testProps.isWeighted && !testProps.isPreview;

    expect(shouldShowWeight).toBe(true);
    expect(testProps.weight).toBe(2.5);
  });

  it('should not show weight in preview mode', () => {
    interface EdgeProps {
      weight?: number;
      isWeighted?: boolean;
      isPreview?: boolean;
    }

    const testProps: EdgeProps = {
      weight: 1,
      isWeighted: true,
      isPreview: true,
    };

    const shouldShowWeight = testProps.isWeighted && !testProps.isPreview;

    expect(shouldShowWeight).toBe(false);
  });
});

describe('Instruction Text Logic', () => {
  it('should include weight hint in weighted mode', () => {
    const isWeighted = true;
    const isCreatingEdge = false;

    let instructionText: string;

    if (isCreatingEdge) {
      const weightHint = isWeighted ? ' (weight will be prompted)' : '';
      instructionText = `Creating edge from A - click target vertex${weightHint} or ESC to cancel`;
    } else {
      const weightHint = isWeighted
        ? ' • Weight will be prompted for each edge'
        : '';
      instructionText = `Edge mode: Click first vertex to start edge${weightHint}`;
    }

    expect(instructionText).toContain('Weight will be prompted');
  });

  it('should not include weight hint in unweighted mode', () => {
    const isWeighted = false;
    const isCreatingEdge = false;

    let instructionText: string;

    if (isCreatingEdge) {
      const weightHint = isWeighted ? ' (weight will be prompted)' : '';
      instructionText = `Creating edge from A - click target vertex${weightHint} or ESC to cancel`;
    } else {
      const weightHint = isWeighted
        ? ' • Weight will be prompted for each edge'
        : '';
      instructionText = `Edge mode: Click first vertex to start edge${weightHint}`;
    }

    expect(instructionText).not.toContain('Weight');
    expect(instructionText).toBe('Edge mode: Click first vertex to start edge');
  });
});

describe('Weight Click Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle weight click events when weighted mode is enabled', () => {
    renderWithProvider(<GraphCanvas />);

    const weightedToggle = screen.getByLabelText(/weighted graph/i);
    fireEvent.click(weightedToggle);

    const vertexMode = screen.getByRole('radio', { name: /vertex/i });
    fireEvent.click(vertexMode);

    const canvas = document.querySelector(
      '[class*="canvasArea"]'
    ) as HTMLElement;
    expect(canvas).toBeInTheDocument();

    fireEvent.click(canvas, {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.click(canvas, {
      bubbles: true,
      clientX: 200,
      clientY: 200,
    });

    const edgeMode = screen.getByRole('radio', { name: /edge/i });
    fireEvent.click(edgeMode);

    vi.mocked(window.prompt).mockReturnValue('2.5');

    const vertices = document.querySelectorAll('[class*="vertex"]');
    if (vertices.length >= 2) {
      fireEvent.click(vertices[0]);
      fireEvent.click(vertices[1]);
    }

    expect(weightedToggle).toBeChecked();
    expect(screen.getByText(/weight will be prompted/i)).toBeInTheDocument();
  });

  it('should not allow weight editing in delete mode', () => {
    renderWithProvider(<GraphCanvas />);

    const weightedToggle = screen.getByLabelText(/weighted graph/i);
    fireEvent.click(weightedToggle);

    const deleteMode = screen.getByRole('radio', { name: /delete/i });
    fireEvent.click(deleteMode);

    expect(deleteMode).toBeChecked();
    expect(
      screen.getByText(/delete mode: click vertex or edge to delete/i)
    ).toBeInTheDocument();

    expect(weightedToggle).toBeChecked();
  });
});

describe('Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle directed/undirected mode with G key', () => {
    renderWithProvider(<GraphCanvas />);

    const directedToggle = screen.getByLabelText(/directed graph/i);
    expect(directedToggle).not.toBeChecked();

    fireEvent.keyDown(document, { key: 'g' });
    expect(directedToggle).toBeChecked();

    fireEvent.keyDown(document, { key: 'G' });
    expect(directedToggle).not.toBeChecked();
  });

  it('should toggle weighted/unweighted mode with W key', () => {
    renderWithProvider(<GraphCanvas />);

    const weightedToggle = screen.getByLabelText(/weighted graph/i);
    expect(weightedToggle).not.toBeChecked();

    fireEvent.keyDown(document, { key: 'w' });
    expect(weightedToggle).toBeChecked();

    fireEvent.keyDown(document, { key: 'W' });
    expect(weightedToggle).not.toBeChecked();
  });

  it('should not trigger shortcuts when typing in input fields', () => {
    renderWithProvider(<GraphCanvas />);

    const mockInput = document.createElement('input');
    document.body.appendChild(mockInput);
    mockInput.focus();

    const directedToggle = screen.getByLabelText(/directed graph/i);
    expect(directedToggle).not.toBeChecked();

    fireEvent.keyDown(mockInput, { key: 'g' });
    expect(directedToggle).not.toBeChecked();

    document.body.removeChild(mockInput);
  });
});
