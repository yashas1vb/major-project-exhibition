import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { CreateFileDialog } from '@/components/workspace/CreateFileDialog';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';

const EditorView = () => {
  const navigate = useNavigate();
  const { workspaceId, fileId } = useParams();
  const {
    currentUser,
    currentWorkspace,
    currentFile,
    fetchWorkspaceById,
    fetchWorkspaceFiles,
    fetchFileById,
    isLoadingFiles,
  } = useStore();
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

  useEffect(() => {
    if (fileId) {
      fetchFileById(fileId);
    }
  }, [fileId, fetchFileById]);

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
      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)]">
        <WorkspaceSidebar onAddFile={() => setShowCreateFileDialog(true)} />
        {isLoadingFiles ? (
          <div className="flex-1 flex items-center justify-center bg-editor">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CodeEditor />
        )}
      </div>
      <CreateFileDialog
        open={showCreateFileDialog}
        onOpenChange={setShowCreateFileDialog}
      />
    </div>
  );
};

export default EditorView;
