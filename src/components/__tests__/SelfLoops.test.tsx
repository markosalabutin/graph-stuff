import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Edge } from '../Edge';

describe('Edge Self-Loop Support', () => {
  it('should render a self-loop when start and end coordinates are the same', () => {
    const { container } = render(
      <svg>
        <Edge
          id="loop-edge"
          startX={100}
          startY={100}
          endX={100}
          endY={100}
          weight={1}
          isDirected={true}
          isWeighted={false}
        />
      </svg>
    );

    // Check that a circle element is rendered for self-loops
    const circleElement = container.querySelector('circle');
    expect(circleElement).toBeInTheDocument();
    
    // Check that no line element is rendered for self-loops
    const lineElement = container.querySelector('line');
    expect(lineElement).toBeNull();
  });

  it('should render a normal line when start and end coordinates are different', () => {
    const { container } = render(
      <svg>
        <Edge
          id="normal-edge"
          startX={100}
          startY={100}
          endX={200}
          endY={200}
          weight={1}
          isDirected={true}
          isWeighted={false}
        />
      </svg>
    );

    // Check that a line element is rendered for normal edges
    const lineElement = container.querySelector('line');
    expect(lineElement).toBeInTheDocument();
    
    // Check that no self-loop circle is rendered for normal edges (there might be weight circles)
    const circles = container.querySelectorAll('circle');
    // For non-weighted edges, there should be no circles, or if any, they should not be loop circles
    if (circles.length > 0) {
      // If there are circles, they should not be positioned as self-loop circles
      const loopCircle = Array.from(circles).find(circle => 
        circle.getAttribute('cy') === '60' // self-loop y position
      );
      expect(loopCircle).toBeNull();
    }
  });

  it('should position weight correctly for self-loops', () => {
    const { container } = render(
      <svg>
        <Edge
          id="weighted-loop"
          startX={100}
          startY={100}
          endX={100}
          endY={100}
          weight={5}
          isDirected={true}
          isWeighted={true}
        />
      </svg>
    );

    // Check that weight text is positioned at the center of the loop circle
    const textElement = container.querySelector('text');
    expect(textElement).toBeInTheDocument();
    expect(textElement?.getAttribute('x')).toBe('100');
    expect(textElement?.getAttribute('y')).toBe('60'); // startY - 40
    expect(textElement?.textContent).toBe('5');
  });
});
