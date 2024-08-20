import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { File } from "../../utils/types";

interface EditorProps {
  files: File[];
  activeFileID: number;
  onSave: (content: string) => void;
}

export const Editor: React.FC<EditorProps> = React.memo(({ files, activeFileID, onSave }) => {
  const [localContent, setLocalContent] = useState('');

  // Memoize the initial content to avoid unnecessary updates
  const initialContent = useMemo(
    () => files.find(file => file.id === activeFileID)?.content || '',
    [files, activeFileID]);

  useEffect(() => {
    setLocalContent(initialContent);
  }, [initialContent]);

  const saveContent = useCallback(() => {
    if (localContent !== initialContent) {
      onSave(localContent);
    }
  }, [localContent, initialContent, onSave]);

  useEffect(() => {
    const timer = setInterval(saveContent, 5000); // Save every 5 seconds
    return () => clearInterval(timer);
  }, [saveContent]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveContent();
    }
  }, [saveContent]);

  return (
    <textarea
      className="w-full h-full p-2 font-mono text-sm resize-none"
      value={localContent}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
});

Editor.displayName = 'Editor';
