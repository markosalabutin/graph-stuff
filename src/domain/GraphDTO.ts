import { z } from 'zod';

export const GraphDTOSchema = z
  .object({
    directed: z.boolean(),
    vertices: z.array(
      z.object({
        id: z.string().min(1, 'Vertex ID cannot be empty'),
        color: z
          .enum(['red', 'blue'], {
            message: 'Color must be either "red" or "blue"',
          })
          .optional(),
      })
    ),
    edges: z.array(
      z.object({
        source: z.string().min(1, 'Source vertex ID cannot be empty'),
        target: z.string().min(1, 'Target vertex ID cannot be empty'),
      })
    ),
  })
  .refine(
    (data) => {
      const vertexIds = data.vertices.map((v) => v.id);
      const uniqueVertexIds = new Set(vertexIds);
      if (vertexIds.length !== uniqueVertexIds.size) {
        return false;
      }

      const vertexIdSet = new Set(vertexIds);
      for (const edge of data.edges) {
        if (!vertexIdSet.has(edge.source) || !vertexIdSet.has(edge.target)) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        'Invalid graph: duplicate vertex IDs or edges reference non-existent vertices',
    }
  );

export type GraphDTO = z.infer<typeof GraphDTOSchema>;
