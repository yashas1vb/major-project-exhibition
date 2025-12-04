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
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
}

export function InviteUserDialog({
    open,
    onOpenChange,
    workspaceId,
}: InviteUserDialogProps) {
    const { inviteUserToWorkspace } = useStore();
    const [email, setEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) return;

        setIsInviting(true);
        try {
            await inviteUserToWorkspace(workspaceId, email.trim());
            toast.success('User invited successfully');
            setEmail('');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to invite user');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <DialogTitle>Invite Teammate</DialogTitle>
                    </div>
                    <DialogDescription>
                        Invite a team member to collaborate on this workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleInvite}
                            className="flex-1"
                            variant="hero"
                            disabled={!email.trim() || isInviting}
                        >
                            {isInviting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Inviting...
                                </>
                            ) : (
                                'Invite'
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
