export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: User | string; // Populated or ID
  members: User[];
  activityLog?: {
    user: string;
    action: string;
    file: string;
    timestamp: string;
  }[];
  createdAt?: string;
}

export interface File {
  id: string;
  workspaceId: string;
  name: string;
  filename?: string;
  language: string;
  content: string;
}

export interface CodeRoom {
  id: string;
  name: string;
  language: string;
  content: string;
  createdAt: string;
  participants: User[];
}

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'cpp'
  | 'java'
  | 'c'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby';

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string; extension: string }[] = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'c', label: 'C', extension: 'c' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
  { value: 'php', label: 'PHP', extension: 'php' },
  { value: 'ruby', label: 'Ruby', extension: 'rb' },
];

export const getFileExtension = (language: SupportedLanguage): string => {
  return SUPPORTED_LANGUAGES.find(l => l.value === language)?.extension || 'txt';
};
