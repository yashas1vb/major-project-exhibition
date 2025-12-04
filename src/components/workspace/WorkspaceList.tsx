import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, Plus, Loader2, MoreVertical, Trash2, LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { JoinWorkspaceDialog } from './JoinWorkspaceDialog';

interface WorkspaceListProps {
  onCreateClick: () => void;
}

export function WorkspaceList({ onCreateClick }: WorkspaceListProps) {
  const navigate = useNavigate();
  const { workspaces, isLoadingWorkspaces, fetchWorkspaces, deleteWorkspace, currentUser } = useStore();
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleDelete = async (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation(); // Prevent navigation
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await deleteWorkspace(workspaceId);
        toast.success('Workspace deleted successfully');
      } catch (error) {
        toast.error('Failed to delete workspace');
      }
    }
  };

  if (isLoadingWorkspaces) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Select a workspace or create a new one
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowJoinDialog(true)} variant="outline">
            <LogIn className="h-4 w-4 mr-2" />
            Join Workspace
          </Button>
          <Button onClick={onCreateClick} variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((workspace) => {
          const isOwner = typeof workspace.ownerId === 'object'
            ? (workspace.ownerId as any)._id === currentUser?.id
            : workspace.ownerId === currentUser?.id;

          return (
            <div
              key={workspace.id}
              onClick={() => navigate(`/workspaces/${workspace.id}`)}
              className="group relative text-left rounded-xl border border-border bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 card-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDelete(e, workspace.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {workspace.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{workspace.members?.length || 0} members</span>
              </div>
            </div>
          );
        })}
      </div>

      {workspaces.length === 0 && (
        <div className="text-center py-20">
          <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first workspace to get started
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => setShowJoinDialog(true)} variant="outline">
              <LogIn className="h-4 w-4 mr-2" />
              Join Workspace
            </Button>
            <Button onClick={onCreateClick} variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>
      )}

      <JoinWorkspaceDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} />
    </div>
  );
}
