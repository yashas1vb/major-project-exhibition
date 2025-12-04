import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkspaceList } from '@/components/workspace/WorkspaceList';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { useStore } from '@/store/useStore';

const Workspaces = () => {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <WorkspaceList onCreateClick={() => setShowCreateDialog(true)} />
        <CreateWorkspaceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </AppLayout>
  );
};

export default Workspaces;
