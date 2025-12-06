import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import {
  FileCode,
  Plus,
  ChevronLeft,
  FileText,
  Loader2,
  UserPlus,
  History,
  Users,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { InviteUserDialog } from './InviteUserDialog';
import { ActivityLogDialog } from './ActivityLogDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkspaceSidebarProps {
  onAddFile: () => void;
}

export function WorkspaceSidebar({ onAddFile }: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const { workspaceId, fileId } = useParams();
  const { currentWorkspace, files, isLoadingFiles } = useStore();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      ts: 'text-cyan',
      tsx: 'text-cyan',
      js: 'text-orange',
      jsx: 'text-orange',
      py: 'text-green',
      java: 'text-destructive',
      cpp: 'text-primary',
      c: 'text-muted-foreground',
      go: 'text-cyan',
      rs: 'text-orange',
      php: 'text-primary',
      rb: 'text-destructive',
    };
    return iconMap[ext || ''] || 'text-muted-foreground';
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
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate('/workspaces')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Workspaces
        </button>
        {currentWorkspace && (
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold truncate" title={currentWorkspace.name}>{currentWorkspace.name}</h2>
              {currentWorkspace.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {currentWorkspace.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-3 w-3 mr-1.5" />
                Invite
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1"
                onClick={() => {
                  const link = `${window.location.origin}/workspaces/${currentWorkspace.id}`;
                  navigator.clipboard.writeText(link);
                  toast.success('Workspace link copied to clipboard');
                }}
              >
                <Share2 className="h-3 w-3 mr-1.5" />
                Share
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowActivityDialog(true)} title="Activity Log">
                <History className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 bg-secondary/50 rounded text-xs text-muted-foreground">
              <span className="truncate flex-1 font-mono">ID: {currentWorkspace.id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentWorkspace.id);
                  toast.success('Workspace ID copied to clipboard');
                }}
                className="hover:text-foreground transition-colors"
                title="Copy ID"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
              </button>
            </div>

            {/* Members Avatars */}
            <div className="flex items-center -space-x-2 overflow-hidden pt-1">
              {currentWorkspace.members?.map((member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-sidebar text-[10px] font-medium text-white ${getColor(member.name || member.username || 'User')}`}
                    >
                      {getInitials(member.name || member.username || 'User')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{member.name || member.username || 'Unknown User'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Files
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onAddFile}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No files yet</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2"
              onClick={onAddFile}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add file
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() =>
                  navigate(`/workspaces/${workspaceId}/files/${file.id}`)
                }
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  fileId === file.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <FileCode className={cn('h-4 w-4', getFileIcon(file.name || file.filename || ''))} />
                <span className="truncate">{file.name || file.filename}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {currentWorkspace && (
        <>
          <InviteUserDialog
            open={showInviteDialog}
            onOpenChange={setShowInviteDialog}
            workspaceId={currentWorkspace.id}
          />
          <ActivityLogDialog
            open={showActivityDialog}
            onOpenChange={setShowActivityDialog}
            activityLog={currentWorkspace.activityLog}
          />
        </>
      )}
    </aside>
  );
}
