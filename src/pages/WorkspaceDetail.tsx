import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { CreateFileDialog } from '@/components/workspace/CreateFileDialog';
import { useStore } from '@/store/useStore';
import { FileCode, Loader2 } from 'lucide-react';

const WorkspaceDetail = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { currentUser, currentWorkspace, fetchWorkspaceById, fetchWorkspaceFiles, isLoadingFiles, joinWorkspace } =
    useStore();
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      // Store current location for redirect after login
      // But usually this is handled by ProtectedRoute. 
      // If we are here, we might need to redirect manually if ProtectedRoute isn't wrapping this perfectly 
      // or if we want to be explicit.
      // For now, assuming standard flow.
      return; // Navigate is handled in checks
    }

    if (workspaceId) {
      // Fetch workspace first
      fetchWorkspaceById(workspaceId);
      fetchWorkspaceFiles(workspaceId);
    }
  }, [currentUser, workspaceId, fetchWorkspaceById, fetchWorkspaceFiles]);

  // Handle auto-join
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldJoin = searchParams.get('join') === 'true';

    if (currentUser && currentWorkspace && workspaceId && shouldJoin) {
      const isMember = currentWorkspace.members?.some((m: any) =>
        (typeof m === 'string' ? m : m._id || m.id) === currentUser.id
      ) || currentWorkspace.ownerId === currentUser.id ||
        (typeof currentWorkspace.ownerId === 'object' && (currentWorkspace.ownerId as any)._id === currentUser.id);

      if (!isMember) {
        // Auto join
        joinWorkspace(workspaceId)
          .then(() => {
            // Remove query param to clean up url
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          })
          .catch((err) => {
            console.error("Failed to auto-join", err);
          });
      }
    }
  }, [currentUser, currentWorkspace, workspaceId, joinWorkspace]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  if (!currentWorkspace && !isLoadingFiles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workspace not found</h2>
          <button
            onClick={() => navigate('/workspaces')}
            className="text-primary hover:underline"
          >
            Back to workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 pt-16">
        <WorkspaceSidebar onAddFile={() => setShowCreateFileDialog(true)} />
        <main className="flex-1 flex items-center justify-center bg-editor">
          {isLoadingFiles ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <div className="text-center">
              <FileCode className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Select a file to start editing</h3>
              <p className="text-muted-foreground">
                Choose a file from the sidebar or create a new one
              </p>
            </div>
          )}
        </main>
      </div>
      <CreateFileDialog
        open={showCreateFileDialog}
        onOpenChange={setShowCreateFileDialog}
      />
    </div>
  );
};

export default WorkspaceDetail;
