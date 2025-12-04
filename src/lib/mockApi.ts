import { Workspace, File, User } from '@/types';

const API_URL = 'http://localhost:3000/api';

export const mockApi = {
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await fetch(`${API_URL}/workspaces`);
    if (!response.ok) throw new Error('Failed to fetch workspaces');
    return response.json();
  },

  async getWorkspaceById(id: string): Promise<Workspace | undefined> {
    const response = await fetch(`${API_URL}/workspaces/${id}`);
    if (!response.ok) return undefined;
    return response.json();
  },

  async createWorkspace(name: string, description?: string, currentUser?: User): Promise<Workspace> {
    const response = await fetch(`${API_URL}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, ownerId: currentUser?.id }),
    });
    if (!response.ok) throw new Error('Failed to create workspace');
    return response.json();
  },

  async deleteWorkspace(id: string): Promise<void> {
    // Not implemented in backend yet
    console.warn('deleteWorkspace not implemented');
  },

  async getWorkspaceFiles(workspaceId: string): Promise<File[]> {
    const response = await fetch(`${API_URL}/workspaces/${workspaceId}/files`);
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
  },

  async getFileById(fileId: string): Promise<File | undefined> {
    const response = await fetch(`${API_URL}/files/${fileId}`);
    if (!response.ok) return undefined;
    return response.json();
  },

  async createFile(workspaceId: string, filename: string, language: string): Promise<File> {
    const response = await fetch(`${API_URL}/workspaces/${workspaceId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: filename, language }),
    });
    if (!response.ok) throw new Error('Failed to create file');
    return response.json();
  },

  async updateFileContent(fileId: string, content: string): Promise<File | undefined> {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) return undefined;
    return response.json();
  },

  async deleteFile(fileId: string): Promise<void> {
    // Not implemented in backend yet
    console.warn('deleteFile not implemented');
  },

  async executeCode(sourceCode: string, languageId: number): Promise<any> {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode, languageId }),
    });
    if (!response.ok) throw new Error('Execution failed');
    return response.json();
  }
};
