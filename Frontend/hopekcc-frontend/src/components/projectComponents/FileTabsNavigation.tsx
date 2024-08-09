import React from 'react';
import { Files } from './templateFiles';
import { FileDisplayButton} from './buttons';
import { FileToolbar } from './FileToolbar';
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
  return (
    <div
      className={`flex flex-col bg-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-64 overflow-y-auto'
      }`}
    >
      <FileToolbar 
        onAddFile={onAddFile} 
        onDeleteFile={onDeleteFile} 
        onRenameFile={onRenameFile} 
        activeFile={activeFile} 
        onUploadFile={onUploadFile}
       />
      {Object.keys(files).map((filename) => (
        <div key={filename} className="flex items-center">
          <FileDisplayButton
            filename={filename}
            onFileSelect={onFileSelect}
            onRename={onRenameFile}
            isActive={activeFile === filename}
          />
        </div>
      ))}
    </div>
  );
};