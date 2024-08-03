import React from 'react';
import { Files } from './templateFiles';
import { AddButton, DeleteButton, FileDisplayButton} from './buttons';

interface FileTabsNavigationProps {
  files: Files;
  activeFile: string;
  onFileSelect: (filename: string) => void;
  onAddFile: () => void;
  onDeleteFile: (filename: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  isCollapsed: boolean;
}

export const FileTabsNavigation: React.FC<FileTabsNavigationProps> = ({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  isCollapsed
}) => {
  return (
    <div
      className={`flex flex-col bg-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-64 overflow-y-auto'
      }`}
    >
      {Object.keys(files).map((filename) => (
        <div key={filename} className="flex items-center">
          <FileDisplayButton
            filename={filename}
            onFileSelect={onFileSelect}
            onRename={onRenameFile}
            isActive={activeFile === filename}
          />
          <DeleteButton onDelete={() => onDeleteFile(filename)} />
        </div>
      ))}
      <AddButton OnAdd={onAddFile} />
    </div>
  );
};