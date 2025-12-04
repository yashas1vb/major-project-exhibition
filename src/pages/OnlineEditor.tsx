import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { SupportedLanguage } from '@/types';
import { Loader2 } from 'lucide-react';
import { OutputPanel } from '@/components/editor/OutputPanel';
import axios from 'axios';
import { toast } from 'sonner';

const DEFAULT_CODE = `// Welcome to CollabCode Online Editor
// Start coding here...

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`;

const OnlineEditor = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  }, []);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/execute`, {
        code,
        language,
      });
      setOutput(response.data);
    } catch (error: any) {
      toast.error('Failed to execute code');
      setOutput({
        status: { description: 'Error' },
        stderr: error.response?.data?.details || error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-editor relative">
        <EditorToolbar
          language={language}
          onLanguageChange={handleLanguageChange}
          content={code}
          filename="untitled"
          isRoom={false}
          onRun={handleRunCode}
        />

        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
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
              padding: { top: 16, bottom: output || isRunning ? 256 : 16 },
            }}
          />

          <OutputPanel
            output={output}
            isRunning={isRunning}
            onClose={() => setOutput(null)}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default OnlineEditor;
