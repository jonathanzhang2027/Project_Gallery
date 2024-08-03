import React from 'react';
import { Files } from './templateFiles';

interface EditorProps {
  files: Files;
  activeFile: string;
  onFileChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Editor: React.FC<EditorProps> = ({ files, activeFile, onFileChange }) => {
  return (
    <textarea
      className="w-full h-full p-2 font-mono text-sm resize-none"
      value={files[activeFile] || ''}
      onChange={onFileChange}
    />
  );
};