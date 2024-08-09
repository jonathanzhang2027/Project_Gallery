import React, { useState, useEffect, useRef } from 'react';

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
    className={`px-2 py-1 text-black hover:bg-gray-300  ${className}`}
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
        return isCollapsed ? '>' : '<';
      case 'right':
        return isCollapsed ? '<' : '>';
      default:
        return isCollapsed ? '<' : '>';
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


export const FileDisplayButton: React.FC<FileDisplayButtonProps> = ({
  filename,
  onFileSelect,
  onRename,
  isActive
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(filename);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (newName && newName !== filename) {
      onRename(filename, newName);
    } else {
      setNewName(filename);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div
      className={`flex-grow px-4 py-2 text-left truncate ${
        isActive ? 'bg-white' : 'hover:bg-gray-300'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
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
        <Button
          onClick={() => onFileSelect(filename)}
          className="w-full text-left hover:bg-transparent hover:text-current"
          >
          {filename}
        </Button>
      )}
    </div>
  );
};


export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete , className = ''}) => (
  <Button
    onClick={onDelete}
    className={`${className}`}
  >
    -
  </Button>
);


export const AddButton: React.FC<AddButtonProps> = ({ OnAdd , className = ''}) => (
  <Button
    onClick={OnAdd}
    className={`${className}`}
  >
    +
  </Button>
);

export const RenameButton: React.FC<RenameButtonProps> = ({ onRename , className = '' }) => (
  <Button onClick={onRename} className={`${className}`}>
    R
  </Button>
);

export const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, className = ''}) => (
  <Button onClick={onUpload} className={`${className}`}>
    ^
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