import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth0 } from '@auth0/auth0-react';
import {File, Project} from './types';
const API_URL = 'http://127.0.0.1:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Custom hook to get the access token

export const useAccessToken = () => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery('accessToken', 
    () => getAccessTokenSilently(),
    {
      staleTime: 1000 * 60 * 59, // 59 minutes
    }
  );
};
// Project hooks

export const useProjectList = () => {
  const { data: accessToken } = useAccessToken();

  return useQuery<Project[], Error>(
    'projects',
    async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await api.get('/projects/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    {
      enabled: !!accessToken,
    }
  );
};

// File hooks
export const useProjectDetail = (projectId: number) => {
  const { data: accessToken } = useAccessToken();

  return useQuery<Project, Error>(
    ['project', projectId],
    async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      try {
        const response = await api.get(`/projects/${projectId}/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    {
      enabled: !!accessToken,
      retry: (failureCount, error) => {
        // Don't retry on 404 errors
        if (error.message === 'Project not found') {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryOnMount: false, // Don't retry on component mount if we already have data
      refetchOnWindowFocus: false, // Don't refetch on window focus
    }
  );
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
    ({ projectId, file }) => api.post(`/files/`, file, {
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