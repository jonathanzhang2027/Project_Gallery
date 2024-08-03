import React from 'react';

interface ProjectDescriptionProps {
  description: string;
  onDescriptionChange: (newDescription: string) => void;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ description, onDescriptionChange }) => (
  <textarea
    className="w-full p-2 border rounded mt-2"
    value={description}
    onChange={(e) => onDescriptionChange(e.target.value)}
    placeholder="Project Description"
    rows={3}
  />
);