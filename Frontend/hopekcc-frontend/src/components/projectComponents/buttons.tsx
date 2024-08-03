import React, { useState, useEffect, useRef } from 'react';

interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, className = '', children }) => (
  <button
    className={`px-2 py-1  ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

interface CollapseButtonProps {
  onCollapseButtonClick: () => void;
  isCollapsed: boolean;
  collapseDirection: string;
}

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

interface FileDisplayButtonProps {
  filename: string;
  onFileSelect: (filename: string) => void;
  onRename: (oldName: string, newName: string) => void;
  isActive: boolean;
}

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
          className="w-full text-left"
        >
          {filename}
        </Button>
      )}
    </div>
  );
};

interface DeleteButtonProps {
  onDelete: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => (
  <Button
    onClick={onDelete}
    className="text-red-600 hover:bg-red-100"
  >
    -
  </Button>
);

interface AddButtonProps {
  OnAdd: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({ OnAdd }) => (
  <Button
    onClick={OnAdd}
    className="text-black hover:bg-gray-300 mt-2"
  >
    +
  </Button>
);

interface DescriptionToggleButtonProps {
  isEditing: boolean;
  onClick: () => void;
}

export const DescriptionToggleButton: React.FC<DescriptionToggleButtonProps> = ({ isEditing, onClick }) => (
  <Button
    onClick={onClick}
    className="bg-gray-200 hover:bg-gray-300"
  >
    {isEditing ? 'Hide Description' : 'Show Description'}
  </Button>
);