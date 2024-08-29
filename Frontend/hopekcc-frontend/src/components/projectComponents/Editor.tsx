import React, { useMemo } from "react";
import { File } from "../../utils/types";
import { SaveButton } from "./Buttons";

interface EditorProps {
  activeFile?: File;
  onSave: (content: string) => void;
  onChange: (content: string) => void;
  message: string;
}

interface EditorToolbarProps {
  onFileSave: () => void;
  message: string;
}

type FileType = "text" | "pdf" | "binary" | "none" | "img" | "unknown";

const getFileType = (file: File | undefined): FileType => {
  if (!file) return "none";
  if (!file.content) return "text"; //no content treat as text

  const extension = file.file_name.split(".").pop()?.toLowerCase();

  // Check for image files
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
      extension || ""
    )
  )
    return "img";

  // Check for PDF
  if (
    extension === "pdf" ||
    file.content.startsWith("%PDF") ||
    file.content.startsWith("JVBERi")
  )
    return "pdf";

  // Check for base64 encoded image data
  if (
    file.content.startsWith("data:image") ||
    file.content.startsWith("iVBORw0KGgo")
  )
    return "img";

  // Check for binary content
  const nonPrintableChars = file.content.match(
    /[\x00-\x08\x0E-\x1F\x7F-\xFF]/g
  );
  if (
    nonPrintableChars !== null &&
    nonPrintableChars.length > file.content.length * 0.1
  )
    return "binary";

  return "text";
};

const FileTypeMessage: React.FC<{ fileType: FileType; fileName: string }> = ({
  fileType,
  fileName,
}) => {
  const messages: { [key in FileType]: string } = {
    pdf: "This is a PDF file and cannot be edited in the text editor.",
    binary:
      "This file contains binary content and cannot be edited in the text editor.",
    none: "No file is currently selected.",
    text: "", // No message for text files as they are editable
    img: "This is an image file and cannot be edited in the text editor.",
    unknown:
      "This file type is unknown and may not be editable in the text editor.",
  };

  if (!messages[fileType]) return null;

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700 mb-2">{messages[fileType]}</p>
      <p className="text-md text-gray-600">File: {fileName}</p>
    </div>
  );
};

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFileSave,
  message,
}) => {
  return (
    <div className="text-black bg-gray-300 px-1 flex justify-start">
      <SaveButton onClick={onFileSave} className="hover:bg-gray-500" />
      <strong className="text-gray-700 ml-2">{message}</strong>
    </div>
  );
};

export const Editor: React.FC<EditorProps> = React.memo(
  ({ activeFile, onSave, onChange, message }) => {
    const content = activeFile?.content || "";
    const fileType = useMemo(() => getFileType(activeFile), [activeFile]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      onChange(newContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        onSave(content);
      }
    };

    if (fileType !== "text") {
      return (
        <FileTypeMessage
          fileType={fileType}
          fileName={activeFile?.file_name || "Unknown"}
        />
      );
    }

    return (
      <div className="flex-col bg-gray-200 ease-in-out w-full">
        <EditorToolbar onFileSave={() => onSave(content)} message={message} />
        <textarea
          className="w-full h-full p-2 font-mono text-sm resize-none"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }
);

Editor.displayName = "Editor";
