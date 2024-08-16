import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { File } from '../../utils/types';
import { DeleteButton, AddButton, UploadButton, RenameButton } from './Buttons';
import { useDeleteFile, useCreateFile, useUpdateFile } from '../../utils/api';
import { mapFileToApiRequest } from '../../utils/mappers';
import { isValidFileName } from '../../utils/fileNameValidtor';

interface ProjectFileListProps {
  projectId: number;
  files: File[];
}

interface FileListItemProps {
  file: File;
  onRename: (fileId: number, newName: string) => Promise<void>;
  onDelete: (fileId: number, filename: string) => Promise<void>;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(file.file_name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return '📄';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.js')) return '🟨';
    return '📄';
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, message } = isValidFileName(newName);
    if (!isValid){
      setIsEditing(false);
      setError(message);
      return;
    }
    if (newName !== file.file_name) {
        await onRename(file.id, newName);
      }
      setIsEditing(false);
      setError(null);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setNewName(file.file_name); // Reset to original name
    setError(null);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <li className="flex items-center justify-between py-2">
      <div className="flex items-center flex-grow">
        <span className="mr-2">{getFileIcon(file.file_name)}</span>
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} className="flex items-center flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleInputBlur}
              className="rounded px-2 py-1 mr-2 "
            />
          </form>
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:text-blue-500"
          >
            {file.file_name.trim()}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!isEditing && (
        <div className="space-x-2">
          <RenameButton onClick={() => setIsEditing(true)} className="p-2" />
          <DeleteButton onClick={() => onDelete(file.id, file.file_name)} className="p-2" />
        </div>
      )}
    </li>
  );
};

const ProjectFileList: React.FC<ProjectFileListProps> = ({ projectId, files: initialFiles }) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const deleteFileMutation = useDeleteFile();
  const createFileMutation = useCreateFile();
  const updateFileMutation = useUpdateFile();

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const handleDelete = async (fileId: number, filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        await deleteFileMutation.mutateAsync({ id: fileId, projectId });
        queryClient.invalidateQueries(['project', projectId]);
      } catch (error) {
        console.error('Error deleting file:', error);
        setError('Failed to delete file. Please try again.');
      }
    }
  };

  const handleRename = async (fileId: number, newName: string) => {
    //Actually rename the file via api
    try {
      const updatedFile = mapFileToApiRequest({ file_name: newName });
      await updateFileMutation.mutateAsync({ id: fileId, data: updatedFile });
      queryClient.invalidateQueries(['project', projectId]);
    } catch (error) {
      console.error('Error renaming file:', error);
      setError('Failed to rename file. Please try again.');
    }
  };

  const handleAdd = async () => {
    const newFileName = prompt('Enter new file name:');
    if (newFileName) {
      const { isValid, message } = isValidFileName(newFileName);
      if (isValid) {
        try {
          const newFile = mapFileToApiRequest({ 
            project: projectId,
            file_name: newFileName,
          });
          console.log('file', newFileName);
          await createFileMutation.mutateAsync({ projectId, file: newFile });
          queryClient.invalidateQueries(['project', projectId]);
        } catch (error) {
          console.error('Error adding file:', error);
          setError('Failed to add file. Please try again.');
        }
      } else {
        setError(message);
      }
    }
  };

  const handleUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const { isValid, message } = isValidFileName(file.name);
          if (isValid) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('project', projectId.toString());
            await createFileMutation.mutateAsync({ projectId, file: formData });
            queryClient.invalidateQueries(['project', projectId]);
          } else {
            setError(message);
          }
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Files</h2>
        <div className="space-x-2">
          <AddButton onClick={handleAdd} className="p-2" />
          <UploadButton onClick={handleUpload} className="p-2" />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2 divide-y divide-gray-200">
        {files.map((file) => (
          <FileListItem
            key={file.id}
            file={file}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProjectFileList;