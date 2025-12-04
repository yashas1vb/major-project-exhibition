import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/types';
import { FileCode, Loader2 } from 'lucide-react';

export function CodeEditor() {
  const { currentFile, updateFileContent } = useStore();

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined) {
        updateFileContent(currentFile.id, value);
      }
    },
    [currentFile, updateFileContent]
  );

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor">
        <div className="text-center">
          <FileCode className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Select a file</h3>
          <p className="text-muted-foreground">
            Choose a file from the sidebar to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-editor">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
        <div className="flex items-center gap-3">
          <FileCode className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">
            {currentFile.filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Language:</span>
          <Select value={currentFile.language} disabled>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={currentFile.language}
          value={currentFile.content}
          onChange={handleEditorChange}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
}
