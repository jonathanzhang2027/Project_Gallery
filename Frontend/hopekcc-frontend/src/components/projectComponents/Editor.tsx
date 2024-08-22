import React, { useState, useEffect } from "react";
import { File } from "../../utils/types";
interface EditorProps {
  activeFile?: File;
  onSave: (content: string) => void;
}

export const Editor: React.FC<EditorProps> = React.memo(
  ({ activeFile, onSave }) => {
    const [localContent, setLocalContent] = useState(activeFile?.content || "");
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalContent(e.target.value);
    };

    useEffect(() => {
      if (activeFile) {
        setLocalContent(activeFile.content || "");
      }
    }, [activeFile?.id]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const saveContent = () => {
        if (activeFile && localContent !== activeFile.content) {
          onSave(localContent);
        }
      };

      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveContent();
      }
    };

    return (
      <textarea
        className="w-full h-full p-2 font-mono text-sm resize-none"
        value={localContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

Editor.displayName = "Editor";
