import api from '@/lib/api';


const timers: Record<string, ReturnType<typeof setTimeout>> = {};


export const handleDebouncedUpdate = (fileId: string, content: string) => {
    if (timers[fileId]) {
        clearTimeout(timers[fileId]);
    }

    timers[fileId] = setTimeout(async () => {
        try {
            await api.put(`/files/${fileId}`, { content });
            delete timers[fileId];
        } catch (error) {
            console.error('Failed to save file:', error);
        }
    }, 1000);
};
