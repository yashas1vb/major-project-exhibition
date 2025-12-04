import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, SupportedLanguage, getFileExtension } from '@/types';
import { Download, Share2, Copy, Check, Users, Code, LogOut, Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditorToolbarProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  content: string;
  filename: string;
  roomId?: string;
  isRoom?: boolean;
  participants?: { id: string; name: string }[];
  onLeave?: () => void;
  onRun?: () => void;
}

export function EditorToolbar({
  language,
  onLanguageChange,
  content,
  filename,
  roomId,
  isRoom = false,
  participants = [],
  onLeave,
  onRun,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const extension = getFileExtension(language);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded successfully!');
  };

  const handleCopyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareRoom = async () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Code Room',
          text: 'Join me for collaborative coding!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Room link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Room link copied to clipboard!');
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get color from name
  const getColor = (name: string) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">{filename}</span>
        </div>

        {isRoom && roomId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
            <span className="text-xs text-muted-foreground">Room:</span>
            <code className="text-xs font-mono text-primary">{roomId}</code>
          </div>
        )}

        {isRoom && (
          <div className="flex items-center -space-x-2 overflow-hidden">
            {participants.map((user) => (
              <div
                key={user.id}
                className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-background text-xs font-medium text-white ${getColor(
                  user.name
                )}`}
                title={user.name}
              >
                {getInitials(user.name)}
              </div>
            ))}
            {participants.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <Users className="h-3.5 w-3.5" />
                <span>0 online</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={(val) => onLanguageChange(val as SupportedLanguage)}>
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

        <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8">
          <Download className="h-4 w-4 mr-1.5" />
          Download
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onRun}
          className="h-8 bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-4 w-4 mr-1.5 fill-current" />
          Run
        </Button>

        {isRoom && roomId && (
          <>
            <Button variant="ghost" size="sm" onClick={handleCopyRoomId} className="h-8">
              {copied ? (
                <Check className="h-4 w-4 mr-1.5 text-green" />
              ) : (
                <Copy className="h-4 w-4 mr-1.5" />
              )}
              Copy ID
            </Button>

            <Button variant="hero" size="sm" onClick={handleShareRoom} className="h-8">
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onLeave}
              className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Leave
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
