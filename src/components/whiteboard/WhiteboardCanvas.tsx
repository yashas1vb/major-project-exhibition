import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, Triangle, Line, IText, PencilBrush, FabricObject, TPointerEvent, TPointerEventInfo } from 'fabric';
import { io, Socket } from 'socket.io-client';
import { WhiteboardToolbar, WhiteboardTool } from './WhiteboardToolbar';
import { toast } from 'sonner';

interface WhiteboardCanvasProps {
  roomId?: string;
  isRoom?: boolean;
  socket?: Socket | null;
}

export function WhiteboardCanvas({ roomId, isRoom = false, socket }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('draw');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isDrawingShape = useRef(false);
  const shapeStartPoint = useRef<{ x: number; y: number } | null>(null);
  const currentShape = useRef<FabricObject | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRemoteUpdate = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#ffffff',
      selection: true,
    });

    // Initialize brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;
    canvas.isDrawingMode = true;

    setFabricCanvas(canvas);

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    setHistory([initialState]);
    setHistoryIndex(0);

    // Handle resize
    const handleResize = () => {
      canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!fabricCanvas || !socket) return;

    socket.on('draw-line', (data: any) => {
      isRemoteUpdate.current = true;
      fabricCanvas.loadFromJSON(data).then(() => {
        fabricCanvas.renderAll();
        saveState();
        isRemoteUpdate.current = false;
      });
    });

    socket.on('room-state', (state: any) => {
      if (state.data && Array.isArray(state.data) && state.data.length > 0) {
        // Get the last state from history
        const lastState = state.data[state.data.length - 1];
        isRemoteUpdate.current = true;
        fabricCanvas.loadFromJSON(lastState).then(() => {
          fabricCanvas.renderAll();
          // Initialize history with this state
          setHistory(state.data.map((d: any) => JSON.stringify(d)));
          setHistoryIndex(state.data.length - 1);
          isRemoteUpdate.current = false;
        });
      }
    });

    socket.on('clear-canvas', () => {
      isRemoteUpdate.current = true;
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
      saveState();
      isRemoteUpdate.current = false;
    });

    return () => {
      socket.off('draw-line');
      socket.off('room-state');
      socket.off('clear-canvas');
    };
  }, [fabricCanvas, socket]);

  // Save state to history and broadcast
  const saveState = useCallback(() => {
    if (!fabricCanvas) return;

    const currentState = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Broadcast change if it's a local update
    if (isRoom && roomId && socket && !isRemoteUpdate.current) {
      socket.emit('draw-line', { roomId, data: JSON.parse(currentState) });
    }
  }, [fabricCanvas, history, historyIndex, isRoom, roomId, socket]);

  // Update tool
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw' || activeTool === 'eraser';
    fabricCanvas.selection = activeTool === 'select';

    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === 'eraser' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = '#ffffff';
      fabricCanvas.freeDrawingBrush.width = brushSize * 3;
    }

    // Update cursor
    if (activeTool === 'pan') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.hoverCursor = 'grab';
    } else if (activeTool === 'draw' || activeTool === 'eraser') {
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.hoverCursor = 'crosshair';
    } else if (['rectangle', 'circle', 'triangle', 'star', 'line', 'arrow'].includes(activeTool)) {
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.hoverCursor = 'crosshair';
    } else {
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'move';
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  // Handle shape drawing (Keep existing logic)
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!['rectangle', 'circle', 'triangle', 'star', 'line', 'arrow', 'text'].includes(activeTool)) return;

      const pointer = fabricCanvas.getViewportPoint(opt.e);
      shapeStartPoint.current = { x: pointer.x, y: pointer.y };

      if (activeTool === 'text') {
        const text = new IText('Type here', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: activeColor,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        saveState();
        return;
      }

      isDrawingShape.current = true;

      if (activeTool === 'rectangle') {
        currentShape.current = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: brushSize,
        });
      } else if (activeTool === 'circle') {
        currentShape.current = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: brushSize,
        });
      } else if (activeTool === 'triangle') {
        currentShape.current = new Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: brushSize,
        });
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        currentShape.current = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: activeColor,
          strokeWidth: brushSize,
        });
      }

      if (currentShape.current) {
        fabricCanvas.add(currentShape.current);
      }
    };

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!isDrawingShape.current || !shapeStartPoint.current || !currentShape.current) return;

      const pointer = fabricCanvas.getViewportPoint(opt.e);
      const startX = shapeStartPoint.current.x;
      const startY = shapeStartPoint.current.y;

      if (activeTool === 'rectangle') {
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        (currentShape.current as Rect).set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width,
          height,
        });
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        ) / 2;
        (currentShape.current as Circle).set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          radius,
        });
      } else if (activeTool === 'triangle') {
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        (currentShape.current as Triangle).set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width,
          height,
        });
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        (currentShape.current as Line).set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      fabricCanvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isDrawingShape.current) {
        isDrawingShape.current = false;
        shapeStartPoint.current = null;

        // Add arrow head for arrow tool
        if (activeTool === 'arrow' && currentShape.current) {
          const line = currentShape.current as Line;
          const x1 = line.x1 || 0;
          const y1 = line.y1 || 0;
          const x2 = line.x2 || 0;
          const y2 = line.y2 || 0;

          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = 15;

          const arrowHead1 = new Line([
            x2, y2,
            x2 - headLen * Math.cos(angle - Math.PI / 6),
            y2 - headLen * Math.sin(angle - Math.PI / 6)
          ], {
            stroke: activeColor,
            strokeWidth: brushSize,
          });

          const arrowHead2 = new Line([
            x2, y2,
            x2 - headLen * Math.cos(angle + Math.PI / 6),
            y2 - headLen * Math.sin(angle + Math.PI / 6)
          ], {
            stroke: activeColor,
            strokeWidth: brushSize,
          });

          fabricCanvas.add(arrowHead1);
          fabricCanvas.add(arrowHead2);
        }

        currentShape.current = null;
        saveState();
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('path:created', saveState);
    fabricCanvas.on('object:modified', saveState);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('path:created', saveState);
      fabricCanvas.off('object:modified', saveState);
    };
  }, [fabricCanvas, activeTool, activeColor, brushSize, saveState]);

  // Pan functionality (Keep existing logic)
  useEffect(() => {
    if (!fabricCanvas) return;

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (activeTool !== 'pan') return;
      isPanning = true;
      const evt = opt.e as MouseEvent;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      fabricCanvas.defaultCursor = 'grabbing';
    };

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!isPanning || activeTool !== 'pan') return;
      const evt = opt.e as MouseEvent;
      const vpt = fabricCanvas.viewportTransform;
      if (vpt) {
        vpt[4] += evt.clientX - lastPosX;
        vpt[5] += evt.clientY - lastPosY;
        fabricCanvas.requestRenderAll();
      }
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    };

    const handleMouseUp = () => {
      isPanning = false;
      if (activeTool === 'pan') {
        fabricCanvas.defaultCursor = 'grab';
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, activeTool]);

  // Keyboard shortcuts (Keep existing logic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'h': setActiveTool('pan'); break;
          case 'd': setActiveTool('draw'); break;
          case 'e': setActiveTool('eraser'); break;
          case 'r': setActiveTool('rectangle'); break;
          case 'c': setActiveTool('circle'); break;
          case 't': setActiveTool('triangle'); break;
          case 's': setActiveTool('star'); break;
          case 'l': setActiveTool('line'); break;
          case 'a': setActiveTool('arrow'); break;
          case 'x': setActiveTool('text'); break;
          case 'delete':
          case 'backspace':
            if (fabricCanvas) {
              const activeObjects = fabricCanvas.getActiveObjects();
              activeObjects.forEach(obj => fabricCanvas.remove(obj));
              fabricCanvas.discardActiveObject();
              fabricCanvas.renderAll();
              saveState();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, saveState]);

  const handleUndo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      // Broadcast undo
      if (isRoom && roomId && socket) {
        socket.emit('draw-line', { roomId, data: JSON.parse(history[newIndex]) });
      }
    });
  };

  const handleRedo = () => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      // Broadcast redo
      if (isRoom && roomId && socket) {
        socket.emit('draw-line', { roomId, data: JSON.parse(history[newIndex]) });
      }
    });
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    saveState();
    toast.success('Canvas cleared!');

    if (isRoom && roomId && socket) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const handleExport = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId || 'untitled'}.png`;
    link.href = dataURL;
    link.click();
    toast.success('Image exported successfully!');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const fabricImage = new (window as any).fabric.Image(img, {
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        fabricCanvas.add(fabricImage);
        fabricCanvas.renderAll();
        saveState();
        toast.success('Image imported!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.2, 3);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.3);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleFitToScreen = () => {
    if (!fabricCanvas) return;
    fabricCanvas.setZoom(1);
    fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    fabricCanvas.renderAll();
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-full">
      <WhiteboardToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        brushSize={brushSize}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onBrushSizeChange={setBrushSize}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onImport={handleImport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        zoom={zoom}
      />
      <div ref={containerRef} className="flex-1 bg-gray-100 overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
