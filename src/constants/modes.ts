export const Mode = {
  VERTEX: 'vertex',
  EDGE: 'edge',
  DELETE: 'delete'
} as const;

export type Mode = typeof Mode[keyof typeof Mode];
