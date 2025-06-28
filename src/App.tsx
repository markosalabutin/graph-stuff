import './App.css';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphProvider } from './context/GraphProvider';

export function App() {
  return (
    <GraphProvider>
      <GraphCanvas />
    </GraphProvider>
  );
}
