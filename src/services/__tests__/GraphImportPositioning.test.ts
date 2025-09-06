import { describe, it, expect } from 'vitest';
import { positionVerticesInCircle } from '../GraphGeneratorService';

describe('GraphImport Positioning Integration', () => {
  it('should position imported vertices correctly', () => {
    const importedVertices = ['v1', 'v2', 'v3'];
    const positions = positionVerticesInCircle(importedVertices);
    
    // Check that all vertices have positions
    expect(Object.keys(positions)).toHaveLength(3);
    expect(positions['v1']).toBeDefined();
    expect(positions['v2']).toBeDefined(); 
    expect(positions['v3']).toBeDefined();
    
    // Check that positions are different (not all at the same spot)
    expect(positions['v1'].x).not.toBe(positions['v2'].x);
    expect(positions['v2'].x).not.toBe(positions['v3'].x);
    expect(positions['v1'].x).not.toBe(positions['v3'].x);
  });

  it('should handle single imported vertex', () => {
    const importedVertices = ['v1'];
    const positions = positionVerticesInCircle(importedVertices);
    
    expect(Object.keys(positions)).toHaveLength(1);
    expect(positions['v1']).toBeDefined();
    expect(typeof positions['v1'].x).toBe('number');
    expect(typeof positions['v1'].y).toBe('number');
  });
});
