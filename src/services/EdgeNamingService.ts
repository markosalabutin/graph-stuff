import type { VertexId, EdgeId } from '../domain/Graph';

export class EdgeNamingService {
  private edgeCounters = new Map<string, number>();

  reset(): void {
    this.edgeCounters.clear();
  }

  generateEdgeId(
    source: VertexId,
    target: VertexId,
    isDirected: boolean = false
  ): EdgeId {
    const edgeKey = isDirected
      ? `${source}-${target}`
      : this.normalizeEdgeKey(source, target);

    const currentCount = this.edgeCounters.get(edgeKey) || 0;
    this.edgeCounters.set(edgeKey, currentCount + 1);

    if (currentCount === 0) {
      return edgeKey;
    }

    return `${edgeKey}#${currentCount + 1}`;
  }

  private normalizeEdgeKey(source: VertexId, target: VertexId): string {
    return source <= target ? `${source}-${target}` : `${target}-${source}`;
  }

  releaseEdgeId(edgeId: EdgeId): void {
    const baseKey = edgeId.includes('#') ? edgeId.split('#')[0] : edgeId;
    const currentCount = this.edgeCounters.get(baseKey) || 0;

    if (currentCount > 0) {
      this.edgeCounters.set(baseKey, currentCount - 1);
    }
  }

  getEdgeCount(
    source: VertexId,
    target: VertexId,
    isDirected: boolean = false
  ): number {
    const edgeKey = isDirected
      ? `${source}-${target}`
      : this.normalizeEdgeKey(source, target);
    return this.edgeCounters.get(edgeKey) || 0;
  }
}

export const defaultEdgeNamingService = new EdgeNamingService();
