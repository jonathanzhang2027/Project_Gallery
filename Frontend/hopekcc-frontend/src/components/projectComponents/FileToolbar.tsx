import React from 'react';
import { AddButton, DeleteButton, RenameButton, UploadButton} from './buttons';

interface FileToolbar {
    activeFile: string;
    onAddFile: () => void;
    onDeleteFile: (filename: string) => void;
    onRenameFile: (oldName: string, newName: string) => void;
    onUploadFile: () => void;
  }


export const FileToolbar: React.FC<FileToolbar> = ({
    activeFile,
    onAddFile,
    onDeleteFile,
    onRenameFile,
    onUploadFile,
  }) => {
    return (
        <>
        <div className='text-black bg-gray-300'>
        <AddButton OnAdd={onAddFile} className='hover:bg-gray-500'/>
        <UploadButton onUpload={onUploadFile} className='hover:bg-gray-500'/>        
        <DeleteButton onDelete={() => (onDeleteFile(activeFile))} className='hover:bg-gray-500'/>
        <RenameButton onRename={() => (onRenameFile)} className='hover:bg-gray-500'/>

        </div>
        </>
        
    );
  }
    
  
