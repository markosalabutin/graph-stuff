import { describe, it, expect } from 'vitest';
import { EulerianPathService } from '../EulerianPathService';
import { MockGraph } from './testUtils';

describe('EulerianPathService Debug', () => {
  it('should debug the complex Eulerian cycle issue', () => {
    const graph = new MockGraph();
    
    // Create a graph with an Eulerian cycle: square with diagonal
    const a = graph.addVertex('A');
    const b = graph.addVertex('B');
    const c = graph.addVertex('C');
    const d = graph.addVertex('D');
    
    graph.addEdge(a, b);
    graph.addEdge(b, c);
    graph.addEdge(c, d);
    graph.addEdge(d, a);
    graph.addEdge(a, c); // Diagonal - now all vertices have even degree
    
    console.log('Graph vertices:', graph.getVertices());
    console.log('Graph edges:', graph.getEdges());
    console.log('Graph type:', graph.getGraphType());
    
    const analysis = EulerianPathService.analyzeGraph(graph);
    console.log('Analysis:', analysis);
    
    const result = EulerianPathService.findEulerianPath(graph);
    console.log('Result:', result);
    
    // Test the analysis first
    expect(analysis.oddDegreeVertices.length).toBe(0);
    expect(analysis.isConnected).toBe(true);
    
    // Each vertex should have degree 2
    expect(analysis.vertexDegrees.get('A')).toBe(3); // edges to B, D, C
    expect(analysis.vertexDegrees.get('B')).toBe(2); // edges to A, C
    expect(analysis.vertexDegrees.get('C')).toBe(3); // edges to B, D, A  
    expect(analysis.vertexDegrees.get('D')).toBe(2); // edges to C, A
  });
});
