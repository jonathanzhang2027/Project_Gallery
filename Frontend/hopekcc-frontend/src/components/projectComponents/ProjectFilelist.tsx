import React, { useState, useEffect, useRef } from "react";
import { File, Project } from "../../utils/types";
import { DeleteButton, AddButton, UploadButton, RenameButton } from "./Buttons";
import { useFileOperations } from "../../utils/api";
import { isValidFileName } from "../../utils/utils";

interface ProjectFileListProps {
  project: Project;
}

interface FileListItemProps {
  file: File;
  onRename: (fileId: number, newName: string) => Promise<void>;
  onDelete: (fileId: number, filename: string) => Promise<void>;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(file.file_name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".html")) return "📄";
    if (fileName.endsWith(".css")) return "🎨";
    if (fileName.endsWith(".js")) return "🟨";
    return "📄";
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, message } = isValidFileName(newName);
    if (!isValid) {
      setError(message);
      setIsEditing(false);
      return;
    }

    if (newName !== file.file_name) {
      // Optimistically update UI
      setIsEditing(false);
      setError(null);

      try {
        // Perform the actual rename operation
        await onRename(file.id, newName);
      } catch (error) {
        // If the rename fails, revert the optimistic update
        setIsEditing(true);
        setError("Failed to rename file. Please try again.");
        // You might also want to revert the file name in the UI if you're displaying it
      }
    } else {
      // No change in name, just exit editing mode
      setIsEditing(false);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setNewName(file.file_name); // Reset to original name
    setError(null);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <li className="flex items-center justify-between py-2">
      <div className="flex items-center flex-grow">
        <span className="mr-2">{getFileIcon(file.file_name)}</span>
        {isEditing ? (
          <form
            onSubmit={handleRenameSubmit}
            className="flex items-center flex-grow"
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleInputBlur}
              className="rounded px-2 py-1 mr-2 "
            />
          </form>
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:text-blue-500"
          >
            {file.file_name.trim()}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!isEditing && (
        <div className="space-x-2">
          <RenameButton onClick={() => setIsEditing(true)} className="p-2" />
          <DeleteButton
            onClick={() => onDelete(file.id, file.file_name)}
            className="p-2"
          />
        </div>
      )}
    </li>
  );
};

const ProjectFileList: React.FC<ProjectFileListProps> = ({ project }) => {
  const {
    handleDelete,
    handleRename,
    handleAdd,
    handleUpload,
    error,
  } = useFileOperations(project.id);

  const onDelete = async (fileId: number, filename: string) => {
    await handleDelete(fileId, filename);
  };

  const onRename = async (fileId: number, newName: string) => {
    await handleRename(fileId, newName);
  };
  const onAdd = async () => {
    const newFileName = prompt("Enter new file name:");
    if (newFileName) {
      await handleAdd(newFileName);
    }
  };

  const onUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Files</h2>
        <div className="space-x-2">
          <AddButton onClick={onAdd} className="p-2" />
          <UploadButton onClick={onUpload} className="p-2" />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2 divide-y divide-gray-200">
        {project.files.map((file) => (
          <FileListItem
            key={file.id}
            file={file}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProjectFileList;
