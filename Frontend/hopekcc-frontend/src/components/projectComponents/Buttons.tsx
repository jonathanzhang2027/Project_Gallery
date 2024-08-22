import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Upload,
  Trash,
  File as Fileimg,
  Eye,
  Save
} from "lucide-react"; //icons
import { File } from "../../utils/types";
// Base ButtonProps interface
interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

// CollapseButton
interface CollapseButtonProps extends Omit<ButtonProps, "onClick"> {
  onCollapseButtonClick: () => void;
  isCollapsed: boolean;
  collapseDirection: "left" | "right";
}
// DescriptionToggleButton
interface EditingButtonProps extends Omit<ButtonProps, "onClick"> {
  isEditing: boolean;
  onClick: () => void;
}

interface FileDisplayButtonProps extends Omit<ButtonProps, "onClick"> {
  file: File;
  onFileSelect: (fileId: number) => void;
  onRename: (fileId: number, newName: string) => void;
  onCancelRename: () => void;
  isActive: boolean;
  isRenaming: boolean;
  onDoubleClick: () => void;
}
interface TitleDisplayButtonProps extends ButtonProps {
  title: string;
  onRename: (oldName: string, newName: string) => void;
}
export const Button: React.FC<ButtonProps> = ({
  onClick,
  className = "",
  children,
  title,
  type,
}) => (
  <button
    className={`px-1 py-1 text-black hover:bg-gray-300  ${className}`}
    onClick={onClick}
    title={title}
    type={type}
  >
    {children}
  </button>
);

export const CollapseButton: React.FC<CollapseButtonProps> = ({
  onCollapseButtonClick,
  isCollapsed,
  collapseDirection,
}) => {
  const getCollapseIcon = () => {
    switch (collapseDirection) {
      case "left":
        return isCollapsed ? <ArrowRight size={15} /> : <ArrowLeft size={15} />;
      case "right":
        return isCollapsed ? <ArrowLeft size={15} /> : <ArrowRight size={15} />;
      default:
        return isCollapsed ? <ArrowLeft size={15} /> : <ArrowRight size={15} />;
    }
  };

  return (
    <Button
      onClick={onCollapseButtonClick}
      className="text-black bg-gray-300 hover:bg-gray-500"
      title="collapse"
    >
      {getCollapseIcon()}
    </Button>
  );
};

export const FileDisplayButton: React.FC<FileDisplayButtonProps> = ({
  file,
  onFileSelect,
  onRename,
  onCancelRename,
  isActive,
  isRenaming,
  onDoubleClick,
}) => {
  const [newName, setNewName] = useState(file.file_name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleBlur = () => {
    if (newName && newName !== file.file_name) {
      onRename(file.id, newName);
    } else {
      onCancelRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      onCancelRename();
    }
  };

  return (
    <div
      className={`flex flex-grow px-4 py-2 text-left truncate ${
        isActive ? "bg-white" : "hover:bg-gray-300"
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
          onClick={() => onFileSelect(file.id)}
          className="w-full text-left hover:bg-transparent hover:text-current flex items-center"
        >
          {file.file_name}
        </button>
      )}
    </div>
  );
};

export const TitleDisplayButton: React.FC<TitleDisplayButtonProps> = ({
  title,
  onRename,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleBlur = () => {
    if (newName && newName !== title) {
      onRename(title, newName);
      setIsRenaming(false);
    } else {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
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
          onClick={() => setIsRenaming(true)}
          className="w-full text-left hover:bg-transparent hover:text-current flex items-center"
        >
          {title}
        </button>
      )}
    </>
  );
};

export const DeleteButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="delete file">
    <Trash />
  </Button>
);
export const SaveButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="save file (Ctrl -s)">
    <Save />
  </Button>
);
export const AddButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="add file">
    <Fileimg />
  </Button>
);

export const RenameButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="rename file">
    <Edit />
  </Button>
);

export const UploadButton: React.FC<ButtonProps> = ({
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="upload file">
    <Upload />
  </Button>
);

export const DescriptionToggleButton: React.FC<EditingButtonProps> = ({
  isEditing,
  onClick,
}) => (
  <Button
    onClick={onClick}
    className="bg-gray-200 hover:bg-gray-300"
    title="description"
  >
    {isEditing ? "Hide Description" : "Show Description"}
  </Button>
);

export const SwitchViewButton: React.FC<EditingButtonProps> = ({
  isEditing,
  onClick,
  className = "",
}) => (
  <Button onClick={onClick} className={`${className}`} title="toggle view">
    {isEditing ? <Eye /> : <Edit />}
  </Button>
);
