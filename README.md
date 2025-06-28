# Advanced Graph Editor

[![Deploy to GitHub Pages](https://github.com/markosalabutin/graph-stuff/actions/workflows/deploy.yml/badge.svg)](https://github.com/markosalabutin/graph-stuff/actions/workflows/deploy.yml)

🚀 **[Live Demo](https://markosalabutin.github.io/graph-stuff)**

An interactive, modular React-based graph editor with support for both directed and undirected graphs, weighted and unweighted edges, and comprehensive editing capabilities.

## Features

### Graph Types

- **Directed Graphs**: Create graphs with directional edges (arrows)
- **Undirected Graphs**: Create graphs with bidirectional connections
- **Weighted Graphs**: Assign numerical weights to edges
- **Unweighted Graphs**: Simple connections without weights

### Editing Modes

- **Vertex Mode (V)**: Add vertices by clicking, drag to move
- **Edge Mode (E)**: Create edges by clicking between vertices
- **Delete Mode (D)**: Remove vertices and edges by clicking

### Interactive Features

- **Drag & Drop**: Move vertices around the canvas
- **Visual Feedback**: Real-time preview when creating edges
- **Edge Weight Editing**: Click on edge weights to modify them
- **Duplicate Prevention**: Automatically prevents duplicate edges
- **Graph Conversion**: Seamlessly convert between directed/undirected modes

### Keyboard Shortcuts

- **V** - Switch to Vertex mode
- **E** - Switch to Edge mode
- **D** - Switch to Delete mode
- **G** - Toggle Directed/Undirected graph
- **W** - Toggle Weighted/Unweighted graph
- **ESC** - Cancel edge creation

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for the exact version)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd graph-stuff

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test:run <test-name>

# Generate coverage report
npm run test:coverage
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the `main` branch triggers a new deployment.

- **Live Demo**: https://markosalabutin.github.io/graph-stuff
- **Deployment Status**: Check the badge above for current deployment status
- **Manual Deployment**: The GitHub Actions workflow handles deployment automatically

## Usage Examples

### Basic Workflow
1. **Create Vertices**: Switch to Vertex mode (V) and click to add vertices
2. **Connect Vertices**: Switch to Edge mode (E) and click between vertices
3. **Enable Weights**: Press W to toggle weighted mode
4. **Set Direction**: Press G to toggle directed/undirected mode
5. **Edit Weights**: Click on edge weight numbers to modify them
6. **Delete Elements**: Switch to Delete mode (D) and click to remove
