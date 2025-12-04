import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { History, FileText, UserPlus, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activityLog?: {
        user: string;
        action: string;
        file: string;
        timestamp: string;
    }[];
}

export function ActivityLogDialog({
    open,
    onOpenChange,
    activityLog = [],
}: ActivityLogDialogProps) {

    const getIcon = (action: string) => {
        if (action.includes('Created')) return <FileText className="h-4 w-4 text-green-500" />;
        if (action.includes('Updated')) return <Edit className="h-4 w-4 text-blue-500" />;
        if (action.includes('Invited')) return <UserPlus className="h-4 w-4 text-purple-500" />;
        return <History className="h-4 w-4 text-gray-500" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <DialogTitle>Activity Log</DialogTitle>
                    </div>
                    <DialogDescription>
                        Recent activity in this workspace.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4 pt-4">
                        {activityLog.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm">No activity yet.</p>
                        ) : (
                            [...activityLog].reverse().map((log, index) => (
                                <div key={index} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                                    <div className="mt-0.5">{getIcon(log.action)}</div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            <span className="text-primary">{log.user}</span> {log.action.toLowerCase()} <span className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">{log.file}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(log.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
