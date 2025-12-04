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
  const { currentUser, currentWorkspace, fetchWorkspaceById, fetchWorkspaceFiles, isLoadingFiles } =
    useStore();
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    if (workspaceId) {
      fetchWorkspaceById(workspaceId);
      fetchWorkspaceFiles(workspaceId);
    }
  }, [currentUser, navigate, workspaceId, fetchWorkspaceById, fetchWorkspaceFiles]);

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
