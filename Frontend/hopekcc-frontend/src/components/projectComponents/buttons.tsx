import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Edit, Upload, Trash, File } from 'lucide-react'; //icons
// Base ButtonProps interface
interface ButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

// CollapseButton
interface CollapseButtonProps extends Omit<ButtonProps, 'onClick'> {
  onCollapseButtonClick: () => void;
  isCollapsed: boolean;
  collapseDirection: 'left' | 'right';
}

// FileDisplayButton
interface FileDisplayButtonProps extends Omit<ButtonProps, 'onClick'> {
  filename: string;
  onFileSelect: (filename: string) => void;
  onRename: (oldName: string, newName: string) => void;
  isActive: boolean;
  isRenaming: boolean;
}

// DeleteButton
interface DeleteButtonProps extends Omit<ButtonProps, 'onClick'> {
  onDelete: () => void;
}

// AddButton
interface AddButtonProps extends Omit<ButtonProps, 'onClick'> {
  OnAdd: () => void;
}

// RenameButton
interface RenameButtonProps extends Omit<ButtonProps, 'onClick'> {
  onRename: () => void;
}

// UploadButton
interface UploadButtonProps extends Omit<ButtonProps, 'onClick'> {
  onUpload: () => void;
}

// DescriptionToggleButton
interface DescriptionToggleButtonProps extends Omit<ButtonProps, 'onClick'> {
  isEditing: boolean;
  onClick: () => void;
}
const Button: React.FC<ButtonProps> = ({ onClick, className = '', children }) => (
  <button
    className={`px-1 py-1 text-black hover:bg-gray-300  ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);


export const CollapseButton: React.FC<CollapseButtonProps> = ({
  onCollapseButtonClick,
  isCollapsed,
  collapseDirection
}) => {
  const getCollapseIcon = () => {
    switch (collapseDirection) {
      case 'left':
        return isCollapsed ? <ArrowRight size={15}/> : <ArrowLeft size={15}/>;
      case 'right':
        return isCollapsed ? <ArrowLeft size={15}/> : <ArrowRight size={15}/>;
      default:
        return isCollapsed ? <ArrowLeft size={15}/> : <ArrowRight size={15}/>;
    }
  };

  return (
    <Button
      onClick={onCollapseButtonClick}
      className="text-black bg-gray-300 hover:bg-gray-500"
    >
      {getCollapseIcon()}
    </Button>
  );
};

interface FileDisplayButtonProps {
  filename: string;
  onFileSelect: (filename: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onCancelRename: () => void;
  isActive: boolean;
  isRenaming: boolean;
  onDoubleClick: () => void;
}

export const FileDisplayButton: React.FC<FileDisplayButtonProps> = ({
  filename,
  onFileSelect,
  onRename,
  onCancelRename,
  isActive,
  isRenaming,
  onDoubleClick
}) => {
  const [newName, setNewName] = useState(filename);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((isRenaming) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleBlur = () => {
    if (newName && newName !== filename) {
      onRename(filename, newName);
    } else {
      onCancelRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      onCancelRename();
    }
  };

  return (
    <div
      className={`flex-grow px-4 py-2 text-left truncate ${
        isActive ? 'bg-white' : 'hover:bg-gray-300'
      }`}
      onDoubleClick={onDoubleClick}
    >
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0 border rounded"
        />
      ) : (
        <button
          onClick={() => onFileSelect(filename)}
          className="w-full text-left hover:bg-transparent hover:text-current"
        >
          {filename}
        </button>
      )}
    </div>
  );
};


export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete , className = ''}) => (
  <Button
    onClick={onDelete}
    className={`${className}`}
  >
    <Trash/>
  </Button>
);


export const AddButton: React.FC<AddButtonProps> = ({ OnAdd , className = ''}) => (
  <Button
    onClick={OnAdd}
    className={`${className}`}
  >
    <File/>
  </Button>
);

export const RenameButton: React.FC<RenameButtonProps> = ({ onRename , className = '' }) => (
  <Button onClick={onRename} className={`${className}`}>
    <Edit/>
  </Button>
);

export const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, className = ''}) => (
  <Button onClick={onUpload} className={`${className}`}>
    <Upload/>
  </Button>
);

export const DescriptionToggleButton: React.FC<DescriptionToggleButtonProps> = ({ isEditing, onClick }) => (
  <Button
    onClick={onClick}
    className="bg-gray-200 hover:bg-gray-300"
  >
    {isEditing ? 'Hide Description' : 'Show Description'}
  </Button>
);