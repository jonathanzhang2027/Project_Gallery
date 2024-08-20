interface File {
  id: number;
  project: number;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  content?: string;
  file?: globalThis.File;  // Add this line to include a built-in File object
}

interface Project {
  id: number;
  auth0_user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  files: File[];
}

export type {
  File,
  Project
}