import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Workspace, File } from '@/types';
import api from '@/lib/api';
import { handleDebouncedUpdate } from './debounceHandler';
import { mockApi } from '@/lib/mockApi'; // Keep for workspace/file for now if not fully migrated

interface AppState {
  // User
  currentUser: User | null;
  isLoadingUser: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (credentials: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoadingWorkspaces: boolean;
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  inviteUserToWorkspace: (workspaceId: string, email: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  joinWorkspace: (workspaceId: string) => Promise<Workspace>;

  // Files
  files: File[];
  currentFile: File | null;
  isLoadingFiles: boolean;
  fetchWorkspaceFiles: (workspaceId: string) => Promise<void>;
  fetchFileById: (fileId: string) => Promise<void>;
  createFile: (workspaceId: string, filename: string, language: string) => Promise<File>;
  updateFileContent: (fileId: string, content: string) => Promise<void>;
  setCurrentFile: (file: File | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      currentUser: null,
      isLoadingUser: false,
      setCurrentUser: (user) => set({ currentUser: user }),

      login: async (credentials) => {
        set({ isLoadingUser: true });
        try {
          const { data } = await api.post('/auth/login', credentials);
          localStorage.setItem('token', data.token);
          set({ currentUser: data.user, isLoadingUser: false });
        } catch (error) {
          set({ isLoadingUser: false });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isLoadingUser: true });
        try {
          const { data } = await api.post('/auth/register', credentials);
          localStorage.setItem('token', data.token);
          set({ currentUser: data.user, isLoadingUser: false });
        } catch (error) {
          set({ isLoadingUser: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ currentUser: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ currentUser: null, isLoadingUser: false });
          return;
        }
        set({ isLoadingUser: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ currentUser: { ...data, id: data.id || data._id }, isLoadingUser: false });
        } catch (error) {
          localStorage.removeItem('token');
          set({ currentUser: null, isLoadingUser: false });
        }
      },

      // Workspaces state
      // Workspaces state
      workspaces: [],
      currentWorkspace: null,
      isLoadingWorkspaces: false,

      fetchWorkspaces: async () => {
        set({ isLoadingWorkspaces: true });
        try {
          const { data } = await api.get('/workspaces');
          const workspaces = data.map((w: any) => ({ ...w, id: w._id }));
          set({ workspaces, isLoadingWorkspaces: false });
        } catch (error) {
          set({ isLoadingWorkspaces: false });
          console.error('Failed to fetch workspaces:', error);
        }
      },

      fetchWorkspaceById: async (id) => {
        try {
          const { data } = await api.get(`/workspaces/${id}`);
          set({ currentWorkspace: { ...data, id: data._id } });
        } catch (error) {
          console.error('Failed to fetch workspace:', error);
          set({ currentWorkspace: null });
        }
      },

      createWorkspace: async (name, description) => {
        const { data } = await api.post('/workspaces', { name, description });
        const workspace = { ...data, id: data._id };
        set((state) => ({ workspaces: [...state.workspaces, workspace] }));
        return workspace;
      },

      inviteUserToWorkspace: async (workspaceId: string, email: string) => {
        try {
          const { data } = await api.post(`/workspaces/${workspaceId}/invite`, { email });
          set((state) => ({
            currentWorkspace: state.currentWorkspace?.id === workspaceId
              ? { ...data, id: data._id }
              : state.currentWorkspace
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteWorkspace: async (workspaceId: string) => {
        try {
          await api.delete(`/workspaces/${workspaceId}`);
          set((state) => ({
            workspaces: state.workspaces.filter(w => w.id !== workspaceId),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? null : state.currentWorkspace
          }));
        } catch (error) {
          throw error;
        }
      },

      joinWorkspace: async (workspaceId: string) => {
        try {
          const { data } = await api.post('/workspaces/join', { workspaceId });
          const workspace = { ...data, id: data._id };
          set((state) => ({ workspaces: [...state.workspaces, workspace] }));
          return workspace;
        } catch (error) {
          throw error;
        }
      },

      // Files state
      files: [],
      currentFile: null,
      isLoadingFiles: false,

      fetchWorkspaceFiles: async (workspaceId) => {
        set({ isLoadingFiles: true });
        try {
          const { data } = await api.get(`/workspaces/${workspaceId}/files`);
          const files = data.map((f: any) => ({ ...f, id: f._id }));
          set({ files, isLoadingFiles: false });
        } catch (error) {
          set({ isLoadingFiles: false });
          console.error('Failed to fetch files:', error);
        }
      },

      fetchFileById: async (fileId) => {
        try {
          const { data } = await api.get(`/files/${fileId}`);
          set({ currentFile: { ...data, id: data._id } });
        } catch (error) {
          console.error('Failed to fetch file:', error);
        }
      },

      createFile: async (workspaceId, filename, language) => {
        const { data } = await api.post(`/workspaces/${workspaceId}/files`, { name: filename, language });
        const file = { ...data, id: data._id };
        set((state) => ({ files: [...state.files, file] }));
        return file;
      },


      // Debounce map for file updates
      updateFileContent: async (fileId, content) => {
        // Optimistic update
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, content } : f
          ),
          currentFile:
            state.currentFile?.id === fileId
              ? { ...state.currentFile, content }
              : state.currentFile,
        }));

        // Debounce API call
        const DEBOUNCE_DELAY = 1000;

        // Access a module-level or static storage for timers if possible. 
        // Since we are inside the create function, we can't easily access "this".
        // However, we can use a closure if we wrap the creator. 
        // OR, we can just attach it to the window or a global object for now, or use a simple hack.
        // Better: Define `debouncedUpdates` outside the store definition.

        // Calling the external debounce handler
        handleDebouncedUpdate(fileId, content);
      },

      setCurrentFile: (file) => set({ currentFile: file }),
    }),
    {
      name: 'collabcode-storage',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
