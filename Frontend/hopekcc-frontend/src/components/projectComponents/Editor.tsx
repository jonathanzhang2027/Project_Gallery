
import React, { useMemo} from 'react';
import { File } from "../../utils/types";
import { SaveButton } from './Buttons';

interface EditorProps {
  activeFile?: File;
  onSave: (content: string) => void;
  onChange: (content : string) => void;
  message:string
}
interface EditorToolbarProps {
  onFileSave: () => void;
  message:string;
}

type FileType = 'text' | 'pdf' | 'binary' | 'none' | 'img';

const getFileType = (content: string): FileType => {
  if (!content) return 'none';
  if (content.startsWith('%PDF') || content.startsWith('JVBERi')) return 'pdf';
  const nonPrintableChars = content.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g);
  if (nonPrintableChars !== null && nonPrintableChars.length > content.length * 0.1) return 'binary';
  // Check for base64 encoded image data
  if (content.startsWith('data:image') || content.startsWith('iVBORw0KGgo')) return 'img';

  return 'text';
};

const FileTypeMessage: React.FC<{ fileType: FileType }> = ({ fileType }) => {
  const messages: { [key in FileType]: string } = {
    pdf: "This is a PDF file and cannot be edited in the text editor.",
    binary: "This file contains binary content and cannot be edited in the text editor.",
    none: "No file is currently selected.",
    text: "", // No message for text files as they are editable
    img: "This is an image file and cannot be edited in the text editor."
  };

  if (!messages[fileType]) return null;

  return (
    <div className="w-full h-full p-4 flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700">{messages[fileType]}</p>
    </div>
  );
};

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFileSave,
  message
}) => {
  return (
    <div className='text-black bg-gray-300 px-1 flex justify-start'>
      <SaveButton onClick={onFileSave} className='hover:bg-gray-500'/>
      <strong className='text-gray-700 ml-2'>{message}</strong>
    </div>
  );
};

export const Editor: React.FC<EditorProps> = React.memo(({ activeFile, onSave, onChange, message }) => {
  const content = activeFile?.content || '';
  const fileType = useMemo(() => getFileType(activeFile?.content || ''), [activeFile]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onChange(newContent);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave(content);
    }
  };

  if (fileType !== 'text') {
    return <FileTypeMessage fileType={fileType} />;
  }

  return (
    <div className='flex-col bg-gray-200 ease-in-out w-full'>
      <EditorToolbar onFileSave={() => onSave(content)} message={message}/>
      <textarea
        className="w-full h-full p-2 font-mono text-sm resize-none"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        />
    </div>
  );
});



Editor.displayName = "Editor";
