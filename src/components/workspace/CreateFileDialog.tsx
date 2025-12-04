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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePlus } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';

interface CreateFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFileDialog({ open, onOpenChange }: CreateFileDialogProps) {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { createFile } = useStore();
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!filename.trim() || !workspaceId) return;

    setIsCreating(true);
    try {
      const file = await createFile(workspaceId, filename.trim(), language);
      setFilename('');
      setLanguage('javascript');
      onOpenChange(false);
      navigate(`/workspaces/${workspaceId}/files/${file.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-primary" />
            <DialogTitle>Create File</DialogTitle>
          </div>
          <DialogDescription>
            Add a new file to your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filename</label>
            <Input
              placeholder="index.js"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
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
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreate}
              className="flex-1"
              variant="hero"
              disabled={!filename.trim() || isCreating}
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
