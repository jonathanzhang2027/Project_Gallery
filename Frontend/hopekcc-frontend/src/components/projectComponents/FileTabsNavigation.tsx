import React, { useState, useEffect, useRef } from 'react';
import { FileDisplayButton, AddButton, DeleteButton, RenameButton, UploadButton } from './Buttons';
import {File} from '../../utils/types'
import { useDeleteFile, useCreateFile, useUpdateFile } from '../../utils/api';
import { mapFileToApiRequest } from '../../utils/mappers';
import { isValidFileName } from '../../utils/utils';
import { useQueryClient } from 'react-query';

interface FileTabsNavigationProps {
  projectId: number;
  files: File[];
  activeFileID: number;
  onFileSelect: (fileId:number) => void;
  onError: (message: string) => void;
}

interface FileToolbarProps {
  activeFileID: number;
  onFileAdd: () => void;
  onFileDelete: () => void;
  onRenameClick: () => void;
  onFileUpload: () => void;
}


export const FileTabsNavigation: React.FC<FileTabsNavigationProps> = ({
  projectId,
  files,
  activeFileID,
  onFileSelect,
  onError,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  

  const createFileMutation = useCreateFile();
  const updateFileMutation = useUpdateFile();
  const deleteFileMutation = useDeleteFile();
  const queryClient = useQueryClient();

  
  const handleDelete = async (fileId: number, filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        await deleteFileMutation.mutateAsync({ id: fileId, projectId });
        queryClient.invalidateQueries(['project', projectId]);
      } catch (error) {
        console.error('Error deleting file:', error);
        onError('Failed to delete file. Please try again.');
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
      onError('Failed to rename file. Please try again.');
    }
    setIsRenaming(false);
  };

  const handleFileAdd = async () => {
    const newFileName = prompt('Enter new file name:');
    if (newFileName) {
      const { isValid, message } = isValidFileName(newFileName);
      if (isValid) {
        try {
          const newFile = mapFileToApiRequest({ 
            project: projectId,
            file_name: newFileName,
            content: ' ',
          });
          await createFileMutation.mutateAsync({ id:projectId, file: newFile });
          queryClient.invalidateQueries(['project', projectId]);
        } catch (error) {
          console.error('Error adding file:', error);
          onError('Failed to add file. Please try again.');
        }
      } else {
        onError(message);
      }
    }
  };

  const handleFileUpload = async () => {
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
            await createFileMutation.mutateAsync({ id:projectId, file: formData });
            queryClient.invalidateQueries(['project', projectId]);
          } else {
            onError(message);
          }
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading file:', error);
      onError('Failed to upload file. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target as Node)) {
        setIsRenaming(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div
      ref={navigationRef}
      className={'flex flex-col bg-gray-200 transition-all duration-300 ease-in-out w-1/2 overflow-y-auto'}
    >
      <FileToolbar 
        onFileAdd={handleFileAdd} 
        onFileDelete={() => handleDelete(activeFileID!, files.find(file => file.id === activeFileID)?.file_name!)} 
        onRenameClick={() => setIsRenaming(true)}
        activeFileID={activeFileID} 
        onFileUpload={handleFileUpload}
      />
      {files.map((file) => (
        <div key={file.id} className="flex items-center">
          <FileDisplayButton
            file={file}
            onFileSelect={onFileSelect}
            onRename={handleRename}
            onCancelRename={() => setIsRenaming(false)}
            onDoubleClick={() => setIsRenaming(true)}
            isActive={activeFileID === file.id}
            isRenaming={activeFileID === file.id && isRenaming}
          />
        </div>
      ))}
    </div>
  );
};

export const FileToolbar: React.FC<FileToolbarProps> = ({
  onFileAdd,
  onFileDelete,
  onRenameClick,
  onFileUpload: onFileUpload,
}) => {
  return (
    <div className='text-black bg-gray-300 px-1 flex justify-start'>
      <AddButton onClick={onFileAdd} className='hover:bg-gray-500'/>
      <UploadButton onClick={onFileUpload} className='hover:bg-gray-500'/>        
      <DeleteButton onClick={onFileDelete} className='hover:bg-gray-500'/>
      <RenameButton onClick={onRenameClick} className='hover:bg-gray-500'/>
    </div>
  );
};