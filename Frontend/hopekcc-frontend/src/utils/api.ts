import axios from 'axios';
import { useState } from 'react';
import { useQueries, useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { File, Project } from './types';
import { isValidFileName, isValidProjectName } from './utils';
import { mapFileToApiRequest } from './mappers';

const API_URL = 'http://127.0.0.1:8000/api';
// Create an axios instance
const api = (token:string | undefined) => {
  if (token){
    return (axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }));
  }else{
    return (axios.create({
      baseURL: API_URL
    }));
  }
  
}


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

/**
 * Custom hook for performing operations on a project.
 * 
 * @param projectId - The ID of the project.
 * @returns An object containing functions for handling project operations, as well as error state and setter.
 */
export const useProjectOperations = (projectId: number) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const handleProjectDelete = async () => {
    if (!confirm(`Are you sure you want to delete this project?`)) return false;

    try {
      await deleteProjectMutation.mutateAsync(projectId);
      // Assuming you have a projects list query
      queryClient.invalidateQueries('projects');
      return true; // Indicate successful deletion
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again later.');
      return false; // Indicate failed deletion
    }
  };

  const handleProjectRename = async (oldName: string, newName: string) => {
    if (!newName.trim() || !isValidProjectName(newName).isValid) {
      setError('Project name error: ' + isValidProjectName(newName).message);
      return false;
    }
  
    // Store the old project data
    const oldProjectData = queryClient.getQueryData<Project>(['project', projectId]);
  
    // Optimistically update the UI
    queryClient.setQueryData<Project | undefined>(['project', projectId], (old) => {
      if (!old) return undefined;
      return { ...old, name: newName };
    });
  
    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data: { name: newName }});
      return true; // Indicate successful rename
    } catch (error) {
      // Revert optimistic update
      if (oldProjectData) {
        queryClient.setQueryData(['project', projectId], oldProjectData);
      } else {
        queryClient.invalidateQueries(['project', projectId]);
      }
      
      console.error('Error renaming project:', error);
      setError(`Failed to rename project from "${oldName}" to "${newName}". The name has been reverted. Please try again.`);
      return false; // Indicate failed rename
    }
  };
 
  const handleProjectChangeDescription = async (newDescription: string) => {
    // Optimistically update the UI
    queryClient.setQueryData<Project | undefined>(['project', projectId], (old) => {
      if (!old) return undefined;
      return { ...old, description: newDescription };
    });

    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data: { description: newDescription } });
      return true; // Indicate successful description change
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries(['project', projectId]);
      console.error('Error changing project description:', error);
      setError('Failed to change project description. Please try again.');
      return false; // Indicate failed description change
    }
  };

  return {
    handleProjectDelete,
    handleProjectRename,
    handleProjectChangeDescription,
    error,
    setError,
  };
};

/**
 * Custom hook for file operations.
 * 
 * @param projectId - The ID of the project.
 * @returns An object containing functions for handling file operations, as well as error state.
 */
export const useFileOperations = (projectId: number) => {
  /*
    
  */
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createFileMutation = useCreateFile();
  const updateFileMutation = useUpdateFile();
  const deleteFileMutation = useDeleteFile();

  const handleDelete = async (fileId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return null;

    // Optimistically update the UI
    queryClient.setQueryData(['project', projectId], (old: any) => ({
      ...old,
      files: old.files.filter((f: File) => f.id !== fileId)
    }));

    try {
      await deleteFileMutation.mutateAsync({ id: fileId, projectId });
      return true; // Indicate successful deletion
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries(['project', projectId]);
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again later.');
      return false; // Indicate failed deletion
    }
  };
  
  const handleRename = async (fileId: number, newName: string) => {
    const { isValid, message } = isValidFileName(newName);
    if (!isValid) {
      setError(message);
      return false;
    }

    // Optimistically update the UI
    queryClient.setQueryData(['project', projectId], (old: any) => ({
      ...old,
      files: old.files.map((f: File) => 
        f.id === fileId ? { ...f, file_name: newName } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append('file_name', newName);
      await updateFileMutation.mutateAsync({ id: fileId, data: formData });
      return true; // Indicate successful rename
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries(['project', projectId]);
      console.error('Error renaming file:', error);
      setError('Failed to rename file. Please try again.');
      return false; // Indicate failed rename
    }
  };

  const handleAdd = async (newFileName: string) => {
    const { isValid, message } = isValidFileName(newFileName);
    if (!isValid) {
      setError(message);
      return null;
    }

    const tempId = Date.now();
    const optimisticFile: Partial<File> = {
      id: tempId,
      file_name: newFileName,
      project: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically update the UI
    queryClient.setQueryData(['project', projectId], (old: any) => ({
      ...old,
      files: [...old.files, optimisticFile]
    }));

    try {
      
      const newFile = mapFileToApiRequest({file_name: newFileName, project: projectId, content: ' '});
      const createdFile = await createFileMutation.mutateAsync({ id: projectId, file: newFile });
      
      // Update the optimistic file with the real data
      queryClient.setQueryData(['project', projectId], (old: any) => ({
        ...old,
        files: old.files.map((f: File) => f.id === tempId ? createdFile : f)
      }));

      return createdFile; // Return the created file
    } catch (error) {
      // Remove the optimistic file
      queryClient.setQueryData(['project', projectId], (old: any) => ({
        ...old,
        files: old.files.filter((f: File) => f.id !== tempId)
      }));
      console.error('Error adding file:', error);
      setError('Failed to add file. Please try again.');
      return null; // Indicate failed add
    }
  };

  const handleUpload = async (file: globalThis.File) => {
    const { isValid, message } = isValidFileName(file.name);
    if (!isValid) {
      setError(message);
      return null;
    }

    const tempId = Date.now();
    const optimisticFile: Partial<File> = {
      id: tempId,
      file_name: file.name,
      project: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically update the UI
    queryClient.setQueryData(['project', projectId], (old: any) => ({
      ...old,
      files: [...old.files, optimisticFile]
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project', projectId.toString());
      const createdFile = await createFileMutation.mutateAsync({ id: projectId, file: formData });
      
      // Update the optimistic file with the real data
      queryClient.setQueryData(['project', projectId], (old: any) => ({
        ...old,
        files: old.files.map((f: File) => f.id === tempId ? createdFile : f)
      }));

      return createdFile; // Return the created file
    } catch (error) {
      // Remove the optimistic file
      queryClient.setQueryData(['project', projectId], (old: any) => ({
        ...old,
        files: old.files.filter((f: File) => f.id !== tempId)
      }));
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      return null; // Indicate failed upload
    }
  };
  const handleFileSave = async (fileId: number, content: string) => {
    const originalFile = queryClient.getQueryData<File>(['fileDetails', fileId]);
    if (!originalFile) {
      throw new Error('File not found');
    }
  
    try {
      const updatedFile = { ...originalFile, content };
      const formData = mapFileToApiRequest(updatedFile);
      await updateFileMutation.mutateAsync({ id: fileId, data: formData });
  
      return true; // Indicate successful save
    } catch (error) {
      
      console.error('Error saving file:', error);
      setError('Failed to save file. Please try again.');
      return false; // Indicate failed save
    }
  };
  return {
    handleDelete,
    handleRename,
    handleAdd,
    handleUpload,
    handleFileSave,
    error,
    setError,
  };
};


export const useProjectList = () => {
  const { data: accessToken } = useAccessToken();

  return useQuery<Project[], Error>(
    'projects',
    async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await api(accessToken).get('/projects/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    {
      enabled: !!accessToken,
    }
  );
};


export const useProjectDetail = (projectId: number) => {
  //fetch project details without file content
  const { data: accessToken } = useAccessToken();
  
  return useQuery<Project, Error>(
    ['project', projectId],
    async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      try {
        const response = await api(accessToken).get(`/projects/${projectId}/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    {
      enabled: !!accessToken,
      retry: (failureCount, error: Error) => {
        // Don't retry on 404 errors
        if (error.message === 'Project not found') {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryOnMount: true, // Don't retry on component mount if we already have data
      refetchOnWindowFocus: true, // Don't refetch on window focus
      staleTime: 60000,
      refetchInterval: 60000

    }
  );
};


export const useCreateProject = () => {
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<Project, Error, Omit<Project, 'id' | 'created_at' | 'updated_at'>>(
    (newProject) => api(accessToken).post('/projects/', newProject).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      },
    }
  );
};

export const useUpdateProject = () => {
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: number; data: Partial<Project> }>(
    ({ id, data }) => api(accessToken).patch(`/projects/${id}/`, data).then(res => res.data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('projects');
        queryClient.invalidateQueries(['projectDetails', data.id]);
      },
    }
  );
};

export const useDeleteProject = () => {
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>(
    (id) => api(accessToken).delete(`/projects/${id}/`).then(() => { }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      },
    }
  );
};

export const useMultipleFileDetails = (fileIds: number[]) => {
  const { data: accessToken } = useAccessToken();

  return useQueries(
    fileIds.map(id => ({
      queryKey: ['fileDetails', id],
      queryFn: async () => {
        if (!accessToken) {
          throw new Error('No access token available');
        }
        const response = await api(accessToken).get(`/files/${id}/`);
        return response.data;
      },
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity, // Keep the data fresh indefinitely
      cacheTime: 1000 * 60 * 60, // Cache the data for 1 hour
      retry: false, // Don't retry on failure
      
    }))
  );
};
export const useFileDetails = (fileId: number) => {
  const { data: accessToken } = useAccessToken();

  return useQuery<File, Error>(['fileDetails', fileId], 
    () => api(accessToken).get(`/files/${fileId}/`).then(res => res.data),
    {
      enabled: !!accessToken && !!fileId,
      retry: (failureCount, error: Error) => {
        if (error.message === 'Project not found') {
          return false;
        }
        return failureCount < 3;
      },
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
};


export const useCreateFile = () => {
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<File, Error, { id: number; file: FormData }>(
    ({ file }) => api(accessToken).post(`/files/`, file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
    {
      onSuccess: (variables) => {
        queryClient.invalidateQueries(['projectFiles', variables.id]);
      },
    }
  );
};

export const useUpdateFile = () => {
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<File, Error, { id: number; data: FormData }>(
    ({ id, data }) => api(accessToken).patch(`/files/${id}/`, data, {
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
  const { data: accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; projectId: number }>(
    ({ id }) => api(accessToken).delete(`/files/${id}/`).then(() => { }),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['projectFiles', variables.projectId]);
      },
    }
  );
};
