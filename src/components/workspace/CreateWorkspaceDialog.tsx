import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const navigate = useNavigate();
  const { createWorkspace } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const workspace = await createWorkspace(name.trim(), description.trim());
      setName('');
      setDescription('');
      onOpenChange(false);
      navigate(`/workspaces/${workspace.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Create Workspace</DialogTitle>
          </div>
          <DialogDescription>
            Create a new workspace to organize your files and collaborate with
            others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              placeholder="A brief description of your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreate}
              className="flex-1"
              variant="hero"
              disabled={!name.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
