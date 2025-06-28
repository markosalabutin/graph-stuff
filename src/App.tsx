import './App.css';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphProvider } from './context/GraphProvider';
import { MSTProvider } from './context/MSTProvider';

export function App() {
  return (
    <GraphProvider>
      <MSTProvider>
        <GraphCanvas />
      </MSTProvider>
    </GraphProvider>
  );
}
