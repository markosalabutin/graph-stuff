import './App.css';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphProvider } from './context/GraphProvider';
import { MSTProvider } from './context/MSTProvider';
import { ShortestPathProvider } from './context/ShortestPathProvider';
import { GraphColoringProvider } from './context/GraphColoringProvider';
import { VisualizationModeProvider } from './context/VisualizationModeProvider';

export function App() {
  return (
    <GraphProvider>
      <MSTProvider>
        <ShortestPathProvider>
          <GraphColoringProvider>
            <VisualizationModeProvider>
              <GraphCanvas />
            </VisualizationModeProvider>
          </GraphColoringProvider>
        </ShortestPathProvider>
      </MSTProvider>
    </GraphProvider>
  );
}
