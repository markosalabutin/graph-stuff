import './App.css';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphProvider } from './context/GraphProvider';
import { MSTProvider } from './context/MSTProvider';
import { ShortestPathProvider } from './context/ShortestPathProvider';
import { VisualizationModeProvider } from './context/VisualizationModeProvider';

export function App() {
  return (
    <GraphProvider>
      <MSTProvider>
        <ShortestPathProvider>
          <VisualizationModeProvider>
            <GraphCanvas />
          </VisualizationModeProvider>
        </ShortestPathProvider>
      </MSTProvider>
    </GraphProvider>
  );
}
