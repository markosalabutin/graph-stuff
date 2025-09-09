import { GraphDTOSchema, type GraphDTO } from '../domain/GraphDTO';

const createGraphImportService = () => {
  const parseGraphDTOFromJson = (
    json: string
  ): {
    success: boolean;
    graphData?: GraphDTO;
    error?: string;
  } => {
    try {
      const parsed = JSON.parse(json);

      const validatedData = GraphDTOSchema.parse(parsed);

      return {
        success: true,
        graphData: validatedData,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: 'Invalid JSON format',
        };
      } else if (error instanceof Error && error.name === 'ZodError') {
        return {
          success: false,
          error: `Invalid graph structure: ${error.message}`,
        };
      } else {
        return {
          success: false,
          error: 'Unknown error occurred while importing graph',
        };
      }
    }
  };

  return { parseGraphDTOFromJson };
};

export const GraphImportService = createGraphImportService();
