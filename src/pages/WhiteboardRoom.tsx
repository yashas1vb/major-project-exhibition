import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { WhiteboardHeader } from '@/components/whiteboard/WhiteboardHeader';
import { useStore } from '@/store/useStore';
import { User } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

// Generate a random room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const WhiteboardRoom = () => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useStore();

  const [roomId, setRoomId] = useState<string>(urlRoomId || '');
  const [participants, setParticipants] = useState<User[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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
      navigate(`/whiteboard/room/${newRoomId}`, { replace: true });
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
      socketRef.current?.emit('join-room', roomId, currentUser);
    });

    socketRef.current.on('room-not-found', () => {
      setNotFound(true);
    });

    socketRef.current.on('room-state', ({ participants }: { participants: any[] }) => {
      // Map backend participants to frontend User type
      const mappedParticipants = participants.map(p => ({
        id: p.userId,
        name: p.username,
        avatar: p.avatarUrl
      }));
      setParticipants(mappedParticipants);
    });

    socketRef.current.on('room-created', () => {
      setIsCreating(false);
      setNotFound(false);
      socketRef.current?.emit('join-room', roomId, currentUser);
      toast.success('Room created successfully!');
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

  const createRoom = () => {
    setIsCreating(true);
    socketRef.current?.emit('create-room', roomId, 'whiteboard');
  };

  const handleLeave = () => {
    socketRef.current?.emit('leave-room', roomId);
    socketRef.current?.disconnect();
    navigate('/home');
    toast.success('Left the room');
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
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <WhiteboardHeader
          roomId={roomId}
          isRoom={true}
          participants={participants}
          onLeave={handleLeave}
        />
        <WhiteboardCanvas roomId={roomId} isRoom={true} socket={socketRef.current} />
      </div>
    </AppLayout>
  );
};

export default WhiteboardRoom;
