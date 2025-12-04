import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { SupportedLanguage, User } from '@/types';
import { useStore } from '@/store/useStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OutputPanel } from '@/components/editor/OutputPanel';
import axios from 'axios';

const DEFAULT_CODE = `// Welcome to CollabCode Room
// Share the room ID with others to collaborate!

function collaborate() {
  console.log("Let's code together!");
}

collaborate();
`;

// Generate a random room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const CodeRoom = () => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoadingUser } = useStore();

  const [roomId, setRoomId] = useState<string>(urlRoomId || '');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [participants, setParticipants] = useState<User[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<any>({});
  const monaco = useMonaco();

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoadingUser, navigate]);

  useEffect(() => {
    // If no room ID in URL, generate one and navigate to it
    if (!urlRoomId && currentUser) {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      navigate(`/room/${newRoomId}`, { replace: true, state: { create: true } });
    } else {
      setRoomId(urlRoomId);
    }
  }, [urlRoomId, navigate, currentUser]);

  useEffect(() => {
    if (!roomId) return;

    // Connect to backend
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      setNotFound(false);

      // Check if we should create the room (from navigation state)
      const shouldCreate = location.state?.create;

      if (shouldCreate) {
        setIsCreating(true);
        socketRef.current?.emit('create-room', roomId, 'code');
      } else {
        socketRef.current?.emit('join-room', roomId, currentUser);
      }
    });

    socketRef.current.on('room-not-found', () => {
      setNotFound(true);
    });

    socketRef.current.on('room-state', ({ data, participants }: { data: string, participants: any[] }) => {
      setCode(data);
      // Map backend participants to frontend User type
      const mappedParticipants = participants.map(p => ({
        id: p.userId,
        name: p.username,
        avatar: p.avatarUrl // Assuming backend sends this if available
      }));
      setParticipants(mappedParticipants);
    });

    socketRef.current.on('room-created', () => {
      setIsCreating(false);
      setNotFound(false);
      socketRef.current?.emit('join-room', roomId, currentUser);
      toast.success('Room created successfully!');
    });

    socketRef.current.on('code-change', (newCode: string) => {
      setCode(newCode);
    });

    socketRef.current.on('user-joined', ({ user }: { user: any }) => {
      if (user) {
        setParticipants(prev => {
          if (prev.some(p => p.id === user.userId)) return prev;
          return [...prev, { id: user.userId, name: user.username }];
        });
        toast.info(`${user.username} joined the room`);
      }
    });

    socketRef.current.on('user-left', ({ userId }: { userId: string }) => {
      setParticipants(prev => {
        const user = prev.find(p => p.id === userId);
        if (user) {
          toast.info(`${user.name} left the room`);
        }
        return prev.filter(p => p.id !== userId);
      });
      // Remove cursor decoration
      if (editorRef.current && decorationsRef.current[userId]) {
        editorRef.current.deltaDecorations(decorationsRef.current[userId], []);
        delete decorationsRef.current[userId];
      }
    });

    socketRef.current.on('cursor-move', ({ userId, username, cursor }: { userId: string, username: string, cursor: any }) => {
      if (!editorRef.current || userId === currentUser?.id) return;

      const position = { lineNumber: cursor.lineNumber, column: cursor.column };

      // Create or update decoration
      const newDecorations = [
        {
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          options: {
            className: `cursor-${userId} remote-cursor`,
            hoverMessage: { value: `${username}` },
            beforeContentClassName: 'remote-cursor-caret', // We'll need some CSS for this
          }
        }
      ];

      const previousDecorations = decorationsRef.current[userId] || [];
      decorationsRef.current[userId] = editorRef.current.deltaDecorations(previousDecorations, newDecorations);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    // Simulate adding current user to participants
    if (currentUser) {
      setParticipants([currentUser]);
    }
  }, [currentUser]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      socketRef.current?.emit('code-change', { roomId, content: value });
    }
  }, [roomId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      socketRef.current?.emit('cursor-move', {
        roomId,
        cursor: {
          lineNumber: e.position.lineNumber,
          column: e.position.column
        },
        user: currentUser
      });
    });
  };

  const createRoom = () => {
    setIsCreating(true);
    socketRef.current?.emit('create-room', roomId, 'code');
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  };

  const handleLeave = () => {
    socketRef.current?.emit('leave-room', roomId);
    socketRef.current?.disconnect();
    navigate('/home');
    toast.success('Left the room');
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

  if (notFound) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Room Not Found</AlertTitle>
            <AlertDescription className="mt-2">
              The room with ID <strong>{roomId}</strong> does not exist.
              <div className="mt-4">
                <Button onClick={createRoom} disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create this Room
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-editor relative">
        <EditorToolbar
          language={language}
          onLanguageChange={handleLanguageChange}
          content={code}
          filename={`room-${roomId}`}
          roomId={roomId}
          isRoom={true}
          participants={participants}
          onLeave={handleLeave}
          onRun={handleRunCode}
        />

        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
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

export default CodeRoom;
