import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import {
  MousePointer2,
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Trash2,
  Download,
  Upload,
  Undo2,
  Redo2,
  Triangle,
  Star,
  ArrowRight,
  Hand,
  Palette,
  Settings2,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type WhiteboardTool = 
  | 'select' 
  | 'pan'
  | 'draw' 
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle'
  | 'star'
  | 'line' 
  | 'arrow'
  | 'text';

interface WhiteboardToolbarProps {
  activeTool: WhiteboardTool;
  activeColor: string;
  brushSize: number;
  onToolChange: (tool: WhiteboardTool) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
}

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#8000FF',
  '#0080FF', '#00FF80', '#FF0080', '#80FF00', '#808080',
  '#C0C0C0', '#800000', '#008000', '#000080', '#808000',
];

const tools: { tool: WhiteboardTool; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { tool: 'select', icon: MousePointer2, label: 'Select (V)' },
  { tool: 'pan', icon: Hand, label: 'Pan (H)' },
  { tool: 'draw', icon: Pencil, label: 'Draw (D)' },
  { tool: 'eraser', icon: Eraser, label: 'Eraser (E)' },
  { tool: 'line', icon: Minus, label: 'Line (L)' },
  { tool: 'arrow', icon: ArrowRight, label: 'Arrow (A)' },
  { tool: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { tool: 'circle', icon: Circle, label: 'Circle (C)' },
  { tool: 'triangle', icon: Triangle, label: 'Triangle (T)' },
  { tool: 'star', icon: Star, label: 'Star (S)' },
  { tool: 'text', icon: Type, label: 'Text (X)' },
];

export function WhiteboardToolbar({
  activeTool,
  activeColor,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onClear,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  canUndo,
  canRedo,
  zoom,
}: WhiteboardToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-sidebar border-b border-border">
      {/* Tools */}
      <div className="flex items-center gap-1 px-2 border-r border-border">
        {tools.map(({ tool, icon: Icon, label }) => (
          <Tooltip key={tool}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'h-9 w-9',
                  activeTool === tool && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onToolChange(tool)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <div
              className="h-5 w-5 rounded-full border-2 border-border"
              style={{ backgroundColor: activeColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Color</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  'h-8 w-8 rounded-lg border-2 transition-all hover:scale-110',
                  activeColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer"
            />
            <span className="text-xs text-muted-foreground font-mono">{activeColor}</span>
          </div>
        </PopoverContent>
      </Popover>

      {/* Brush Size */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Brush Size</span>
                <span className="text-xs text-muted-foreground">{brushSize}px</span>
              </div>
              <Slider
                value={[brushSize]}
                onValueChange={([val]) => onBrushSizeChange(val)}
                min={1}
                max={50}
                step={1}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>

        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onFitToScreen}>
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to Screen</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onImport}>
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import Image</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export as PNG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
