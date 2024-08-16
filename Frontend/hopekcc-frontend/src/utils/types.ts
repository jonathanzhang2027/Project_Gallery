interface File {
  id: number;
  project: number;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  file_content?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
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
  User,
  Project
}