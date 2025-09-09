import { describe, it, expect } from 'vitest';
import { GraphImportService } from '../GraphImportService';

describe('GraphImportService', () => {
  describe('parseGraphDTOFromJson', () => {
    it('should successfully import valid graph data', async () => {
      const validGraphJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A', color: 'red' },
          { id: 'B', color: 'blue' },
        ],
        edges: [
          { source: 'A', target: 'B' },
        ],
      });

      const result = GraphImportService.parseGraphDTOFromJson(validGraphJson);

      expect(result.success).toBe(true);
      expect(result.graphData).toBeDefined();
      expect(result.graphData?.directed).toBe(false);
      expect(result.graphData?.vertices).toHaveLength(2);
      expect(result.graphData?.edges).toHaveLength(1);
    });

    it('should fail with invalid JSON', async () => {
      const invalidJson = 'invalid json {';

      const result = GraphImportService.parseGraphDTOFromJson(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('should fail when missing required fields', async () => {
      const incompleteGraphJson = JSON.stringify({
        directed: true,
        vertices: [
          { }, // missing id (required field)
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(incompleteGraphJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should fail when vertices array is missing', async () => {
      const noVerticesJson = JSON.stringify({
        directed: false,
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(noVerticesJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should fail when directed field is not boolean', async () => {
      const invalidDirectedJson = JSON.stringify({
        directed: 'yes',
        vertices: [
          { id: 'A', color: 'red' },
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(invalidDirectedJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should handle empty vertices and edges arrays', async () => {
      const emptyGraphJson = JSON.stringify({
        directed: false,
        vertices: [],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(emptyGraphJson);

      expect(result.success).toBe(true);
      expect(result.graphData?.vertices).toHaveLength(0);
      expect(result.graphData?.edges).toHaveLength(0);
    });

    it('should succeed when color is omitted (optional field)', async () => {
      const noColorJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A' }, // no color field
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(noColorJson);

      expect(result.success).toBe(true);
      expect(result.graphData?.vertices[0].color).toBeUndefined();
    });

    it('should fail when color format is invalid', async () => {
      const invalidColorJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A', color: 'green' }, // invalid color (not red or blue)
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(invalidColorJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should accept both red and blue colors', async () => {
      const validColorsJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A', color: 'red' },
          { id: 'B', color: 'blue' },
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(validColorsJson);

      expect(result.success).toBe(true);
      expect(result.graphData?.vertices[0].color).toBe('red');
      expect(result.graphData?.vertices[1].color).toBe('blue');
    });

    it('should fail when vertex ID is empty', async () => {
      const emptyIdJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: '', color: 'red' }, // empty ID
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(emptyIdJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should fail when there are duplicate vertex IDs', async () => {
      const duplicateIdJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A', color: 'red' },
          { id: 'A', color: 'blue' }, // duplicate ID
        ],
        edges: [],
      });

      const result = GraphImportService.parseGraphDTOFromJson(duplicateIdJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });

    it('should fail when edge references non-existent vertex', async () => {
      const invalidEdgeJson = JSON.stringify({
        directed: false,
        vertices: [
          { id: 'A', color: 'red' },
        ],
        edges: [
          { source: 'A', target: 'B' }, // B doesn't exist
        ],
      });

      const result = GraphImportService.parseGraphDTOFromJson(invalidEdgeJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid graph structure');
    });
  });
});
