import React from 'react';
import { FileData } from './templateFiles';
import { DeleteButton, AddButton, RenameButton, UploadButton } from './Buttons'; // Adjust the import path as needed

interface ProjectFileListProps {
  files: FileData[];
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  onAdd: () => void;
  onUpload: () => void;
}

const ProjectFileList: React.FC<ProjectFileListProps> = ({ files, onDelete, onRename, onAdd, onUpload }) => {
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return '📄';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.js')) return '🟨';
    return '📁';
  };

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Files</h2>
        <div className="space-x-2">
          <AddButton onClick={onAdd} className="p-2" />
          <UploadButton onClick={onUpload} className="p-2" />
        </div>
      </div>
      <ul className="space-y-2 divide-y divide-gray-200">
        {files.map((file) => (
          <li key={file.id} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <span className="mr-2">{getFileIcon(file.file_name)}</span>
              {file.file_name}
            </div>
            <div className="space-x-2">
              <RenameButton onClick={() => onRename(file.id)} className="p-2" />
              <DeleteButton onClick={() => onDelete(file.id)} className="p-2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectFileList;