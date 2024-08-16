import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = 'http://127.0.0.1:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config) => {
  const { getAccessTokenSilently } = useAuth0();
  const token = await getAccessTokenSilently();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Project types
interface Project {
  id: number;
  auth0_user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// File types
interface File {
  id: number;
  project: number;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  content?: string; // This will be populated when fetching a single file
}

// Project hooks
export const useProjectList = () => {
  return useQuery<Project[]>('projects', () => api.get('/projects/').then(res => res.data));
};

export const useProjectDetails = (id: number) => {
  return useQuery<Project>(['projectDetails', id], () => api.get(`/projects/${id}/`).then(res => res.data), {
    enabled: !!id // Only run the query if id is provided
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, Omit<Project, 'id' | 'created_at' | 'updated_at'>>(
    (newProject) => api.post('/projects/', newProject).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      },
    }
  );
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: number; data: Partial<Project> }>(
    ({ id, data }) => api.put(`/projects/${id}/`, data).then(res => res.data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('projects');
        queryClient.invalidateQueries(['projectDetails', data.id]);
      },
    }
  );
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>(
    (id) => api.delete(`/projects/${id}/`).then(() => {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      },
    }
  );
};

// File hooks
export const useProjectFiles = (projectId: number) => {
  return useQuery<File[]>(['projectFiles', projectId], () => 
    api.get(`/projects/${projectId}/files/`).then(res => res.data),
    {
      enabled: !!projectId // Only run the query if projectId is provided
    }
  );
};

export const useFileDetails = (fileId: number) => {
  return useQuery<File>(['fileDetails', fileId], () => 
    api.get(`/files/${fileId}/`).then(res => res.data),
    {
      enabled: !!fileId // Only run the query if fileId is provided
    }
  );
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  return useMutation<File, Error, { projectId: number; file: FormData }>(
    ({ projectId, file }) => api.post(`/projects/${projectId}/files/`, file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['projectFiles', variables.projectId]);
      },
    }
  );
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation<File, Error, { id: number; data: FormData }>(
    ({ id, data }) => api.put(`/files/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['projectFiles', data.project]);
        queryClient.invalidateQueries(['fileDetails', data.id]);
      },
    }
  );
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; projectId: number }>(
    ({ id }) => api.delete(`/files/${id}/`).then(() => {}),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['projectFiles', variables.projectId]);
      },
    }
  );
};