import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { File } from "../../utils/types";
import { useFileOperations } from '../../utils/api';
interface EditorProps {
  activeFile?: File;
  onSave: (content: string) => void;
}
const areEqual = (prevProps: EditorProps, nextProps: EditorProps) => {
  return prevProps.activeFile?.id === nextProps.activeFile?.id &&
         prevProps.activeFile?.content === nextProps.activeFile?.content &&
         prevProps.onSave === nextProps.onSave;
};
export const Editor: React.FC<EditorProps> =  React.memo(({ activeFile, onSave }) => {
  
  const [localContent, setLocalContent] = useState(activeFile?.content || '');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };
  useEffect(() => {
    if (activeFile) {
      setLocalContent(activeFile.content || '');
    }
  }, [activeFile]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const saveContent = () => {
      if (activeFile && localContent !== activeFile.content) {
        onSave(localContent);
      }
    };
  
    if (e.ctrlKey && e.key === 's') {
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
}, areEqual);


Editor.displayName = 'Editor';
