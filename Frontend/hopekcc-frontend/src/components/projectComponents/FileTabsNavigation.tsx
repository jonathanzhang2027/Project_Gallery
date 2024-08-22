import React, { useState, useEffect, useRef } from "react";
import {
  FileDisplayButton,
  AddButton,
  DeleteButton,
  RenameButton,
  UploadButton,
} from "./Buttons";
import { File } from "../../utils/types";
import { useFileOperations } from "../../utils/api";

interface FileTabsNavigationProps {
  projectId: number;
  files: File[];
  activeFileID: number;
  onFileSelect: (fileId: number) => void;
  onError: (message: string) => void;
}

interface FileToolbarProps {
  activeFileID: number;
  onFileAdd: () => void;
  onFileDelete: () => void;
  onRenameClick: () => void;
  onFileUpload: () => void;
}

export const FileTabsNavigation: React.FC<FileTabsNavigationProps> = ({
  projectId,
  files,
  activeFileID,
  onFileSelect,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  const { handleDelete, handleRename, handleAdd, handleUpload } =
    useFileOperations(projectId);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setIsRenaming(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={navigationRef}
      className={
        "flex flex-col bg-gray-200 transition-all duration-300 ease-in-out w-1/2 overflow-y-auto"
      }
    >
      <FileToolbar
        onFileAdd={onAdd}
        onFileDelete={() =>
          onDelete(
            activeFileID,
            files.find((file) => file.id === activeFileID)?.file_name!
          )
        }
        onRenameClick={() => setIsRenaming(true)}
        activeFileID={activeFileID}
        onFileUpload={onUpload}
      />
      {files.map((file) => (
        <div key={file.id} className="flex items-center">
          <FileDisplayButton
            file={file}
            onFileSelect={onFileSelect}
            onRename={onRename}
            onCancelRename={() => setIsRenaming(false)}
            onDoubleClick={() => setIsRenaming(true)}
            isActive={activeFileID === file.id}
            isRenaming={activeFileID === file.id && isRenaming}
          />
        </div>
      ))}
    </div>
  );
};

const FileToolbar: React.FC<FileToolbarProps> = ({
  onFileAdd,
  onFileDelete,
  onRenameClick,
  onFileUpload: onFileUpload,
}) => {
  return (
    <div className="text-black bg-gray-300 px-1 flex justify-start">
      <AddButton onClick={onFileAdd} className="hover:bg-gray-500" />
      <UploadButton onClick={onFileUpload} className="hover:bg-gray-500" />
      <DeleteButton onClick={onFileDelete} className="hover:bg-gray-500" />
      <RenameButton onClick={onRenameClick} className="hover:bg-gray-500" />
    </div>
  );
};
