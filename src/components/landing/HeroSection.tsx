import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { Users, Code, UserCircle, Pencil } from 'lucide-react';
import { TypingEffect } from '@/components/ui/TypingEffect';

export function HeroSection() {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useStore();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinMode, setJoinMode] = useState<'create-code' | 'join-code' | 'create-board' | 'join-board' | null>(null);

  const handleJoin = () => {
    if (displayName.trim()) {
      const user = {
        id: Date.now().toString(),
        name: displayName.trim(),
      };
      setCurrentUser(user);
      setShowJoinDialog(false);

      if (joinMode === 'join-code' && joinRoomId.trim()) {
        navigate(`/room/${joinRoomId.trim().toUpperCase()}`);
      } else if (joinMode === 'create-code') {
        navigate('/room');
      } else if (joinMode === 'join-board' && joinRoomId.trim()) {
        navigate(`/whiteboard/room/${joinRoomId.trim().toUpperCase()}`);
      } else if (joinMode === 'create-board') {
        navigate('/whiteboard/room');
      }

      setJoinMode(null);
      setJoinRoomId('');
    }
  };

  const handleCreateRoom = (type: 'code' | 'board') => {
    if (currentUser) {
      navigate(type === 'code' ? '/room' : '/whiteboard/room');
    } else {
      setJoinMode(type === 'code' ? 'create-code' : 'create-board');
      setShowJoinDialog(true);
    }
  };

  const handleJoinRoom = (type: 'code' | 'board') => {
    setJoinMode(type === 'code' ? 'join-code' : 'join-board');
    setShowJoinDialog(true);
  };

  const handleOnlineEditor = () => navigate('/editor');
  const handleWhiteboard = () => navigate('/whiteboard');

  const isCodeMode = joinMode === 'create-code' || joinMode === 'join-code';
  const isJoinMode = joinMode === 'join-code' || joinMode === 'join-board';

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center bg-glow">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">


          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Code & Draw Together{' '}
            <br className="hidden md:block" />
            <span className="text-gradient">
              <TypingEffect words={['Anytime.', 'Anywhere.', 'Seamlessly.']} />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time collaborative code editors and whiteboards—all in one place.
            Create a room and invite others to collaborate instantly.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-delay-1">
          {/* Code Editor Section */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden card-shadow">
            <div className="p-6 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Code Editor</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Multi-language code editor with syntax highlighting
              </p>
            </div>

            {/* Code preview */}
            <div className="p-4 font-mono text-sm bg-editor border-b border-border">
              <div className="space-y-1">
                <p>
                  <span className="text-primary">function</span>{' '}
                  <span className="text-green">collaborate</span>
                  <span className="text-muted-foreground">() {'{'}</span>
                </p>
                <p className="pl-4">
                  <span className="text-muted-foreground">console.</span>
                  <span className="text-cyan">log</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-orange">"Hello!"</span>
                  <span className="text-muted-foreground">);</span>
                </p>
                <p className="text-muted-foreground">{'}'}</p>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="heroOutline" onClick={handleOnlineEditor} className="w-full">
                  <Code className="h-4 w-4 mr-2" />
                  Solo Editor
                </Button>
                <Button variant="hero" onClick={() => handleCreateRoom('code')} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => handleJoinRoom('code')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Join with Room ID
              </Button>
            </div>
          </div>

          {/* Whiteboard Section */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden card-shadow">
            <div className="p-6 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-cyan/10">
                  <Pencil className="h-6 w-6 text-cyan" />
                </div>
                <h2 className="text-2xl font-bold">Whiteboard</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Draw, sketch, and brainstorm with full toolset
              </p>
            </div>

            {/* Whiteboard preview */}
            <div className="p-4 bg-white border-b border-border h-[88px] flex items-center justify-center">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border-2 border-blue-500"></div>
                <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500"></div>
                <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[42px] border-l-transparent border-r-transparent border-b-green-500"></div>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <path d="M24 4 L28 18 L44 18 L31 28 L35 44 L24 34 L13 44 L17 28 L4 18 L20 18 Z" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="heroOutline" onClick={handleWhiteboard} className="w-full">
                  <Pencil className="h-4 w-4 mr-2" />
                  Solo Board
                </Button>
                <Button variant="hero" onClick={() => handleCreateRoom('board')} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => handleJoinRoom('board')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Join with Room ID
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {isCodeMode ? (
                <Code className="h-5 w-5 text-primary" />
              ) : (
                <Pencil className="h-5 w-5 text-cyan" />
              )}
              <DialogTitle>
                {isJoinMode
                  ? `Join ${isCodeMode ? 'Code Room' : 'Whiteboard'}`
                  : `Create ${isCodeMode ? 'Code Room' : 'Whiteboard'}`}
              </DialogTitle>
            </div>
            <DialogDescription>
              {isJoinMode
                ? 'Enter the room ID and your display name to join.'
                : 'Enter your display name to create a new room.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {isJoinMode && (
              <Input
                placeholder="Room ID (e.g., XK42AB)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={6}
              />
            )}
            <Input
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus={!isJoinMode}
            />
            <div className="flex gap-3">
              <Button onClick={handleJoin} className="flex-1" variant="hero">
                {isJoinMode ? 'Join Room' : 'Create Room'}
              </Button>
              <Button
                onClick={() => {
                  setShowJoinDialog(false);
                  setJoinMode(null);
                  setJoinRoomId('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
