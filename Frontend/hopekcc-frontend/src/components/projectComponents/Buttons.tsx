import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Edit, Upload, Trash, File, Eye, Download, ZoomIn, ZoomOut} from 'lucide-react'; //icons
// Base ButtonProps interface
interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

// CollapseButton
interface CollapseButtonProps extends Omit<ButtonProps, 'onClick'> {
  onCollapseButtonClick: () => void;
  isCollapsed: boolean;
  collapseDirection: 'left' | 'right';
}
// DescriptionToggleButton
interface EditingButtonProps extends Omit<ButtonProps, 'onClick'> {
  isEditing: boolean;
  onClick: () => void;
}

interface FileDisplayButtonProps extends Omit<ButtonProps, 'onClick'>{
  filename: string;
  onFileSelect: (filename: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onCancelRename: () => void;
  isActive: boolean;
  isRenaming: boolean;
  onDoubleClick: () => void;
}
interface TitleDisplayButtonProps extends ButtonProps {
  title: string;
  onRename: (oldName:string, newName: string) => void;
  onCancelRename: () => void;
  isRenaming: boolean;
}
export const Button: React.FC<ButtonProps> = ({ onClick, className = '', children, type }) => (
  <button
    className={`px-1 py-1 text-black hover:bg-gray-300  ${className}`}
    onClick={onClick}
    type={type}
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
      className={`flex flex-grow px-4 py-2 text-left truncate ${
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
          className="w-full text-left hover:bg-transparent hover:text-current flex items-center"
        >
          {filename}
        </button>
      )}
    </div>
  );
};

export const TitleDisplayButton: React.FC<TitleDisplayButtonProps> = ({
  title,
  onClick,
  onRename,
  onCancelRename,
  isRenaming, 
}) => {
  const [newName, setNewName] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((isRenaming) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleBlur = () => {
    if (newName && newName !== title) {
      onRename(title, newName);
      onCancelRename();
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
    <>
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-bg text-gray-700 "
        />
      ) : (
        <button
          onClick={onClick}
          className="w-full text-left hover:bg-transparent hover:text-current flex items-center"
        >
          {title}
        </button>
      )}
      </>
  );
};


export const DeleteButton: React.FC<ButtonProps> = ({ onClick , className = ''}) => (
  <Button
    onClick={onClick}
    className={`${className}`}
  >
    <Trash/>
  </Button>
);


export const AddButton: React.FC<ButtonProps> = ({ onClick , className = ''}) => (
  <Button
    onClick={onClick}
    className={`${className}`}
  >
    <File/>
  </Button>
);

export const RenameButton: React.FC<ButtonProps> = ({ onClick , className = '' }) => (
  <Button onClick={onClick} className={`${className}`}>
    <Edit/>
  </Button>
);

export const UploadButton: React.FC<ButtonProps> = ({ onClick, className = ''}) => (
  <Button onClick={onClick} className={`${className}`}>
    <Upload/>
  </Button>
);


export const DescriptionToggleButton: React.FC<EditingButtonProps> = ({ isEditing, onClick }) => (
  <Button
    onClick={onClick}
    className="bg-gray-200 hover:bg-gray-300"
  >
    {isEditing ? 'Hide Description' : 'Show Description'}
  </Button>
);


export const SwitchViewButton: React.FC<EditingButtonProps> = ({ isEditing, onClick, className = ''}) => (
  <Button onClick={onClick} className={`${className}`}>
    {isEditing ? <Eye/> : <Edit/>}
  </Button>
);
