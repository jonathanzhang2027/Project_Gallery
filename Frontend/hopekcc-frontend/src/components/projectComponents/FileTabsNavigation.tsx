import React, { useState, useEffect, useRef } from 'react';
import { Files } from './templateFiles';
import { FileDisplayButton, AddButton, DeleteButton, RenameButton, UploadButton } from './buttons';

interface FileTabsNavigationProps {
  files: Files;
  activeFile: string;
  onFileSelect: (filename: string) => void;
  onAddFile: () => void;
  onDeleteFile: (filename: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  onUploadFile: () => void;
  isCollapsed: boolean;
}

interface FileToolbarProps {
  activeFile: string;
  onAddFile: () => void;
  onDeleteFile: () => void;
  onRenameClick: () => void;
  onUploadFile: () => void;
}

export const FileTabsNavigation: React.FC<FileTabsNavigationProps> = ({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
  isCollapsed
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

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

  const handleRenameClick = () => {
    setIsRenaming(true);
  };

  const handleRename = (oldName: string, newName: string) => {
    onRenameFile(oldName, newName);
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
  };

  const handleDoubleClick = () => {
    setIsRenaming(true);
  }
  return (
    <div
      ref={navigationRef}
      className={`flex flex-col bg-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-1/4 overflow-y-auto'
      }`}
    >
      <FileToolbar 
        onAddFile={onAddFile} 
        onDeleteFile={() => onDeleteFile(activeFile)} 
        onRenameClick={handleRenameClick}
        activeFile={activeFile} 
        onUploadFile={onUploadFile}
      />
      {Object.keys(files).map((filename) => (
        <div key={filename} className="flex items-center">
          <FileDisplayButton
            filename={filename}
            onFileSelect={onFileSelect}
            onRename={handleRename}
            onCancelRename={handleCancelRename}
            onDoubleClick={handleDoubleClick}
            isActive={activeFile === filename}
            isRenaming={activeFile === filename && isRenaming}
          />
        </div>
      ))}
    </div>
  );
};

export const FileToolbar: React.FC<FileToolbarProps> = ({
  onAddFile,
  onDeleteFile,
  onRenameClick,
  onUploadFile,
}) => {
  return (
    <div className='text-black bg-gray-300 px-1 flex justify-start'>
      <AddButton onClick={onAddFile} className='hover:bg-gray-500'/>
      <UploadButton onClick={onUploadFile} className='hover:bg-gray-500'/>        
      <DeleteButton onClick={onDeleteFile} className='hover:bg-gray-500'/>
      <RenameButton onClick={onRenameClick} className='hover:bg-gray-500'/>
    </div>
  );
};