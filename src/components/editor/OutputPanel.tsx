import { X, Minimize2, Maximize2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface OutputPanelProps {
    output: {
        stdout: string | null;
        stderr: string | null;
        compile_output: string | null;
        status: { id: number; description: string };
        time: string;
        memory: number;
    } | null;
    isRunning: boolean;
    onClose: () => void;
}

export function OutputPanel({ output, isRunning, onClose }: OutputPanelProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!output && !isRunning) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-border transition-all duration-300 z-40 ${isMinimized ? 'h-10' : 'h-64'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-10 bg-[#252526] border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Output</span>
                    {isRunning && (
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running...
                        </div>
                    )}
                    {!isRunning && output && (
                        <div className={`flex items-center gap-1.5 text-xs ${output.stderr || output.compile_output ? 'text-red-400' : 'text-green-400'}`}>
                            {output.stderr || output.compile_output ? (
                                <AlertCircle className="h-3 w-3" />
                            ) : (
                                <CheckCircle2 className="h-3 w-3" />
                            )}
                            {output.status.description}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-[#333]"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? (
                            <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                            <Minimize2 className="h-3.5 w-3.5 text-gray-400" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-[#333] hover:text-red-400"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="h-[calc(100%-2.5rem)] overflow-auto p-4 font-mono text-sm">
                    {isRunning ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Executing code...</span>
                        </div>
                    ) : output ? (
                        <div className="space-y-4">
                            {output.stdout && (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">STDOUT</div>
                                    <pre className="text-gray-300 whitespace-pre-wrap">{output.stdout}</pre>
                                </div>
                            )}
                            {output.stderr && (
                                <div>
                                    <div className="text-xs text-red-400 mb-1">STDERR</div>
                                    <pre className="text-red-300 whitespace-pre-wrap">{output.stderr}</pre>
                                </div>
                            )}
                            {output.compile_output && (
                                <div>
                                    <div className="text-xs text-yellow-400 mb-1">COMPILATION ERROR</div>
                                    <pre className="text-yellow-300 whitespace-pre-wrap">{output.compile_output}</pre>
                                </div>
                            )}
                            {!output.stdout && !output.stderr && !output.compile_output && (
                                <div className="text-gray-500 italic">No output</div>
                            )}

                            <div className="pt-4 mt-4 border-t border-gray-800 flex gap-4 text-xs text-gray-500">
                                <span>Time: {output.time}s</span>
                                <span>Memory: {output.memory}KB</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
