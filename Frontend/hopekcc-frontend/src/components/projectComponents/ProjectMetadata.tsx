import React from "react";

interface ProjectMetadataProps {
  description: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
}

const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  description,
  createdAt,
  updatedAt,
  fileCount,
}) => {
  return (
    <div className="text-left mb-6">
      <p className="text-gray-400">
        <strong>Description:</strong>
      </p>
      <p className="text-gray-600 mb-4">{description}</p>
      <p>
        <strong>Created:</strong> {new Date(createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Last Updated:</strong> {new Date(updatedAt).toLocaleString()}
      </p>
      <p>
        <strong>Total Files:</strong> {fileCount}
      </p>
    </div>
  );
};

export default ProjectMetadata;
