import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGraph } from '../context/GraphContext';
import { useMSTContext } from '../context/MSTContext';
import { useShortestPath } from '../context/ShortestPathContext';
import { useGraphColoring } from '../context/GraphColoringContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { getColorByIndex } from '../constants/colorPalette';
import { generateCompleteGraph } from '../services/GraphGeneratorService';
import { ModeSelector } from './ModeSelector';
import { GraphOptions } from './GraphOptions';
import { MSTVisualization } from './MSTVisualization';
import { ShortestPathVisualization } from './ShortestPathVisualization';
import { AllPairsShortestPathVisualization } from './AllPairsShortestPathVisualization';
import { GraphColoringVisualization } from './GraphColoringVisualization';
import { InstructionText } from './InstructionText';
import { Edge } from './Edge';
import { Vertex } from './Vertex';
import styles from './GraphCanvas.module.css';
import type { VertexId, EdgeId, Weight } from '../domain/Graph';
import { Mode } from '../constants/modes';
import type { Mode as ModeType } from '../constants/modes';

interface VertexPosition {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  draggedVertex: VertexId | null;
  offset: { x: number; y: number };
}

interface EdgeCreationState {
  isCreatingEdge: boolean;
  sourceVertex: VertexId | null;
  previewTarget?: { x: number; y: number };
  hoveredVertex?: VertexId | null;
}

export const GraphCanvas: React.FC = () => {
  const {
    addVertex,
    getVertices,
    getEdges,
    addEdge,
    removeVertex,
    removeEdge,
    setEdgeWeight,
    transitionGraphType,
    getGraphType,
  } = useGraph();
  const { mstEdgeIds, isMSTVisualizationActive } = useMSTContext();
  const { state: shortestPathState, actions: shortestPathActions } =
    useShortestPath();
  const { coloringResult, isActive: isColoringActive } = useGraphColoring();
  const canvasRef = useRef<HTMLDivElement>(null);

  const vertices = getVertices();
  const edges = getEdges();

  const [currentMode, setCurrentMode] = useState<ModeType>(Mode.VERTEX);
  const [isDirected, setIsDirected] = useState<boolean>(
    () => getGraphType() === 'directed'
  );
  const [isWeighted, setIsWeighted] = useState<boolean>(false);
  const [positions, setPositions] = useState<Record<VertexId, VertexPosition>>(
    {}
  );

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedVertex: null,
    offset: { x: 0, y: 0 },
  });

  const [edgeCreationState, setEdgeCreationState] = useState<EdgeCreationState>(
    {
      isCreatingEdge: false,
      sourceVertex: null,
      previewTarget: undefined,
      hoveredVertex: null,
    }
  );

  const [isShortestPathSelectionMode, setIsShortestPathSelectionMode] =
    useState(false);

  // Track "s" key for shortest path selection mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 's' && !event.repeat) {
        setIsShortestPathSelectionMode(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 's') {
        setIsShortestPathSelectionMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleModeChange = useCallback((newMode: ModeType) => {
    setCurrentMode(newMode);

    setEdgeCreationState({
      isCreatingEdge: newMode === Mode.EDGE,
      sourceVertex: null,
      previewTarget: undefined,
      hoveredVertex: null,
    });
  }, []);

  const handleGraphTypeChange = useCallback(
    (newIsDirected: boolean) => {
      const targetType = newIsDirected ? 'directed' : 'undirected';
      transitionGraphType(targetType);
      setIsDirected(newIsDirected);
    },
    [transitionGraphType]
  );

  const handleWeightedChange = useCallback((newIsWeighted: boolean) => {
    setIsWeighted(newIsWeighted);
  }, []);

  const handleGenerateCompleteGraph = useCallback((n: number) => {
    try {
      generateCompleteGraph(
        {
          addVertex,
          getVertex: (id: VertexId) => {
            const vertices = getVertices();
            return vertices.includes(id) ? id : null;
          },
          getVertices,
          getEdges,
          addEdge,
          setEdgeWeight,
          removeVertex,
          removeEdge,
          transitionGraphType,
          getGraphType,
        },
        n,
        positions,
        setPositions
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate complete graph');
    }
  }, [addVertex, getVertices, getEdges, addEdge, setEdgeWeight, removeVertex, removeEdge, transitionGraphType, getGraphType, positions, setPositions]);

  const handleEscapeEdgeCreation = useCallback(() => {
    setEdgeCreationState((prev) => ({
      ...prev,
      sourceVertex: null,
      previewTarget: undefined,
      hoveredVertex: null,
    }));
  }, []);

  useKeyboardShortcuts({
    currentMode,
    onModeChange: handleModeChange,
    onGraphTypeChange: handleGraphTypeChange,
    onWeightedChange: handleWeightedChange,
    onEscapeEdgeCreation: handleEscapeEdgeCreation,
    isDirected,
    isWeighted,
  });

  const handleAddVertex = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;

      if (currentMode !== Mode.VERTEX) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newVertexId = addVertex();
      setPositions((prev) => ({
        ...prev,
        [newVertexId]: { x, y },
      }));
    },
    [addVertex, currentMode]
  );

  const getEdgeWeight = useCallback((): Weight => {
    if (!isWeighted) {
      return 1;
    }

    while (true) {
      const weightInput = prompt('Enter edge weight:', '1');

      if (weightInput === null) {
        throw new Error('Weight input cancelled');
      }

      const parsedWeight = parseFloat(weightInput.trim());

      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        alert('Please enter a valid positive number for the weight.');
        continue;
      }

      return parsedWeight;
    }
  }, [isWeighted]);

  const handleVertexClick = useCallback(
    (vertexId: VertexId) => {
      // Handle shortest path vertex selection when "s" key is held (highest priority except delete)
      if (isShortestPathSelectionMode && currentMode !== Mode.DELETE) {
        // If no source is selected, set this vertex as source
        if (!shortestPathState.sourceVertex) {
          shortestPathActions.setSourceVertex(vertexId);
          return;
        }

        // If source is selected but no target, and this is different from source
        if (
          shortestPathState.sourceVertex &&
          !shortestPathState.targetVertex &&
          shortestPathState.sourceVertex !== vertexId
        ) {
          shortestPathActions.setTargetVertex(vertexId);
          return;
        }

        // If both are selected, clicking on a vertex starts a new selection
        if (shortestPathState.sourceVertex && shortestPathState.targetVertex) {
          shortestPathActions.clearPath();
          shortestPathActions.setSourceVertex(vertexId);
          return;
        }

        return; // Exit early to prevent other mode handling
      }

      // Handle delete mode
      if (currentMode === Mode.DELETE) {
        removeVertex(vertexId);
        setPositions((prev) => {
          const newPositions = { ...prev };
          delete newPositions[vertexId];
          return newPositions;
        });
        return;
      }

      // Handle edge creation mode
      if (currentMode === Mode.EDGE) {
        if (edgeCreationState.sourceVertex === null) {
          setEdgeCreationState((prev) => ({
            ...prev,
            sourceVertex: vertexId,
          }));
        } else if (edgeCreationState.sourceVertex !== vertexId) {
          const source = edgeCreationState.sourceVertex;
          const target = vertexId;

          const edgeExists = edges.some((edge) => {
            if (isDirected) {
              return edge.source === source && edge.target === target;
            } else {
              return (
                (edge.source === source && edge.target === target) ||
                (edge.source === target && edge.target === source)
              );
            }
          });

          if (!edgeExists) {
            try {
              const weight = getEdgeWeight();
              addEdge(source, target, weight);
            } catch {
              setEdgeCreationState((prev) => ({
                ...prev,
                sourceVertex: null,
                previewTarget: undefined,
                hoveredVertex: null,
              }));
              return;
            }
          }

          setEdgeCreationState((prev) => ({
            ...prev,
            sourceVertex: null,
            previewTarget: undefined,
            hoveredVertex: null,
          }));
        }
        return;
      }
    },
    [
      currentMode,
      edgeCreationState,
      addEdge,
      removeVertex,
      edges,
      isDirected,
      getEdgeWeight,
      shortestPathActions,
      shortestPathState.sourceVertex,
      shortestPathState.targetVertex,
      isShortestPathSelectionMode,
    ]
  );

  const handleEdgeClick = useCallback(
    (edgeId: EdgeId) => {
      if (currentMode === Mode.DELETE) {
        removeEdge(edgeId);
      }
    },
    [currentMode, removeEdge]
  );

  const handleWeightClick = useCallback(
    (edgeId: EdgeId, currentWeight: Weight) => {
      while (true) {
        const weightInput = prompt(
          'Enter new edge weight:',
          currentWeight.toString()
        );

        if (weightInput === null) {
          return;
        }

        const parsedWeight = parseFloat(weightInput.trim());

        if (isNaN(parsedWeight) || parsedWeight <= 0) {
          alert('Please enter a valid positive number for the weight.');
          continue;
        }

        setEdgeWeight(edgeId, parsedWeight);
        break;
      }
    },
    [setEdgeWeight]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, vertexId: VertexId) => {
      if (currentMode === Mode.DELETE || currentMode === Mode.EDGE) {
        event.stopPropagation();
        handleVertexClick(vertexId);
        return;
      }

      // In VERTEX mode or when "s" key is held, handle clicks appropriately
      if (isShortestPathSelectionMode) {
        event.stopPropagation();
        handleVertexClick(vertexId);
        return;
      }

      // Default behavior: start dragging in VERTEX mode
      event.stopPropagation();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const vertexPosition = positions[vertexId];
      if (!vertexPosition) return;

      setDragState({
        isDragging: true,
        draggedVertex: vertexId,
        offset: {
          x: event.clientX - rect.left - vertexPosition.x,
          y: event.clientY - rect.top - vertexPosition.y,
        },
      });
    },
    [positions, currentMode, handleVertexClick, isShortestPathSelectionMode]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (currentMode === Mode.EDGE && edgeCreationState.sourceVertex) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setEdgeCreationState((prev) => ({
          ...prev,
          previewTarget: { x, y },
        }));
      }

      if (!dragState.isDragging || !dragState.draggedVertex) return;

      const x = event.clientX - rect.left - dragState.offset.x;
      const y = event.clientY - rect.top - dragState.offset.y;

      setPositions((prev) => ({
        ...prev,
        [dragState.draggedVertex!]: { x, y },
      }));
    },
    [dragState, currentMode, edgeCreationState.sourceVertex]
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedVertex: null,
      offset: { x: 0, y: 0 },
    });
  }, []);

  const handleVertexMouseEnter = useCallback(
    (vertexId: VertexId) => {
      if (
        currentMode === Mode.EDGE &&
        edgeCreationState.sourceVertex &&
        edgeCreationState.sourceVertex !== vertexId
      ) {
        setEdgeCreationState((prev) => ({
          ...prev,
          hoveredVertex: vertexId,
        }));
      }
    },
    [currentMode, edgeCreationState.sourceVertex]
  );

  const handleVertexMouseLeave = useCallback(() => {
    if (currentMode === Mode.EDGE) {
      setEdgeCreationState((prev) => ({
        ...prev,
        hoveredVertex: null,
      }));
    }
  }, [currentMode]);

  const handleMouseLeave = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedVertex: null,
      offset: { x: 0, y: 0 },
    });

    if (currentMode === Mode.EDGE && edgeCreationState.sourceVertex) {
      setEdgeCreationState((prev) => ({
        ...prev,
        previewTarget: undefined,
        hoveredVertex: null,
      }));
    }
  }, [currentMode, edgeCreationState.sourceVertex]);

  const renderEdge = (edge: {
    id: EdgeId;
    source: VertexId;
    target: VertexId;
    weight: Weight;
  }) => {
    const sourcePos = positions[edge.source];
    const targetPos = positions[edge.target];

    if (!sourcePos || !targetPos) return null;

    // Check if this edge is part of the shortest path
    const isShortestPathEdge =
      shortestPathState.result?.path &&
      shortestPathState.result.path.length > 1 &&
      shortestPathState.result.path.some((pathVertex, index) => {
        if (index === shortestPathState.result!.path.length - 1) return false; // Skip last vertex
        const nextVertex = shortestPathState.result!.path[index + 1];
        return (
          (pathVertex === edge.source && nextVertex === edge.target) ||
          (pathVertex === edge.target &&
            nextVertex === edge.source &&
            !isDirected)
        );
      });

    return (
      <Edge
        key={edge.id}
        id={edge.id}
        startX={sourcePos.x}
        startY={sourcePos.y}
        endX={targetPos.x}
        endY={targetPos.y}
        weight={edge.weight}
        isDirected={isDirected}
        isWeighted={isWeighted}
        isInDeleteMode={currentMode === Mode.DELETE}
        isMSTEdge={mstEdgeIds.has(edge.id)}
        isMSTVisualizationActive={isMSTVisualizationActive}
        isShortestPathEdge={isShortestPathEdge}
        isShortestPathVisualizationActive={shortestPathState.isVisualizationActive}
        onEdgeClick={handleEdgeClick}
        onWeightClick={
          isWeighted && currentMode !== Mode.DELETE
            ? handleWeightClick
            : undefined
        }
      />
    );
  };

  const renderPreviewEdge = () => {
    if (
      currentMode !== Mode.EDGE ||
      !edgeCreationState.sourceVertex ||
      !edgeCreationState.previewTarget
    ) {
      return null;
    }

    const sourcePos = positions[edgeCreationState.sourceVertex];
    if (!sourcePos) return null;

    return (
      <Edge
        startX={sourcePos.x}
        startY={sourcePos.y}
        endX={edgeCreationState.previewTarget.x}
        endY={edgeCreationState.previewTarget.y}
        weight={1}
        isDirected={isDirected}
        isWeighted={isWeighted}
        isPreview={true}
      />
    );
  };

  return (
    <div className={styles.canvas}>
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <div className={`${styles.controlCard} ${styles.instructions}`}>
            <InstructionText
              currentMode={currentMode}
              edgeCreationState={edgeCreationState}
              isWeighted={isWeighted}
            />
          </div>
          <GraphOptions
            isDirected={isDirected}
            onDirectedChange={handleGraphTypeChange}
            isWeighted={isWeighted}
            onWeightedChange={handleWeightedChange}
            onGenerateCompleteGraph={handleGenerateCompleteGraph}
          />
          <MSTVisualization isWeighted={isWeighted} />
          <ShortestPathVisualization isWeighted={isWeighted} />
          <AllPairsShortestPathVisualization isWeighted={isWeighted} />
          <GraphColoringVisualization />
        </div>
        <div className={styles.rightControls}>
          <ModeSelector
            currentMode={currentMode}
            onModeChange={handleModeChange}
          />
        </div>
      </div>

      <div className={`${styles.controlCard} ${styles.counter}`}>
        Vertices: {vertices.length} • Edges: {edges.length}
      </div>

      <div
        ref={canvasRef}
        onClick={handleAddVertex}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`${styles.canvasArea} ${
          dragState.isDragging
            ? styles.dragging
            : isShortestPathSelectionMode
              ? styles.shortestPathMode
              : currentMode === Mode.EDGE
                ? styles.edgeMode
                : currentMode === Mode.DELETE
                  ? styles.deleteMode
                  : styles.idle
        }`}
      >
        {edges.map(renderEdge)}

        {renderPreviewEdge()}

        {vertices.map((vertexId) => {
          const position = positions[vertexId];
          if (!position) return null;

          // Graph coloring
          const getVertexColor = (): string | undefined => {
            if (!isColoringActive || !coloringResult) return undefined;
            const colorIndex = coloringResult.coloring.get(vertexId);
            if (colorIndex === undefined) return undefined;
            return getColorByIndex(colorIndex);
          };

          // Shortest path
          const isShortestPathSource =
            shortestPathState.sourceVertex === vertexId;
          const isShortestPathTarget =
            shortestPathState.targetVertex === vertexId;
          const isShortestPathVertex =
            shortestPathState.result?.path &&
            shortestPathState.result.path.includes(vertexId) &&
            !isShortestPathSource &&
            !isShortestPathTarget;

          return (
            <Vertex
              key={vertexId}
              id={vertexId}
              x={position.x}
              y={position.y}
              isDragging={dragState.draggedVertex === vertexId}
              isSourceVertex={edgeCreationState.sourceVertex === vertexId}
              isHoveredTarget={edgeCreationState.hoveredVertex === vertexId}
              isInDeleteMode={currentMode === Mode.DELETE}
              isShortestPathSource={isShortestPathSource}
              isShortestPathTarget={isShortestPathTarget}
              isShortestPathVertex={isShortestPathVertex}
              isShortestPathVisualizationActive={shortestPathState.isVisualizationActive}
              isColoringActive={isColoringActive}
              coloringColor={getVertexColor()}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleVertexMouseEnter}
              onMouseLeave={handleVertexMouseLeave}
            />
          );
        })}
      </div>
    </div>
  );
};
