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
import { LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface JoinWorkspaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JoinWorkspaceDialog({
    open,
    onOpenChange,
}: JoinWorkspaceDialogProps) {
    const navigate = useNavigate();
    const { joinWorkspace } = useStore();
    const [workspaceId, setWorkspaceId] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!workspaceId.trim()) return;

        setIsJoining(true);
        try {
            const workspace = await joinWorkspace(workspaceId.trim());
            toast.success('Joined workspace successfully');
            setWorkspaceId('');
            onOpenChange(false);
            navigate(`/workspaces/${workspace.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to join workspace');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <LogIn className="h-5 w-5 text-primary" />
                        <DialogTitle>Join Workspace</DialogTitle>
                    </div>
                    <DialogDescription>
                        Enter the Workspace ID to join an existing workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Workspace ID</label>
                        <Input
                            placeholder="e.g., 64f8a..."
                            value={workspaceId}
                            onChange={(e) => setWorkspaceId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleJoin}
                            className="flex-1"
                            variant="hero"
                            disabled={!workspaceId.trim() || isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                'Join'
                            )}
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
