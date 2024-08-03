import React, { useState } from 'react';
import { ProjectTitle } from './projectMeta/ProjectTitle';
import { DescriptionToggleButton } from './buttons';
import { ProjectDescription } from './projectMeta/ProjectDescription';

interface ProjectMetadataProps {
  title: string;
  description: string;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <div className="bg-white p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <ProjectTitle title={title} onTitleChange={onTitleChange} />
        <DescriptionToggleButton 
          isEditing={isEditingDescription} 
          onClick={() => setIsEditingDescription(!isEditingDescription)} 
        />
      </div>
      {isEditingDescription && (
        <ProjectDescription description={description} onDescriptionChange={onDescriptionChange} />
      )}
    </div>
  );
};