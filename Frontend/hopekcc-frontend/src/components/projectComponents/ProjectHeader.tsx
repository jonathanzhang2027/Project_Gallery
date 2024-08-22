// ProjectHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface ProjectHeaderProps {
  projectName: string;
  projectId: number;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  projectId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{projectName}</h1>
      <div>
        <button
          onClick={() => navigate(`/edit-project/${projectId}`)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Open in Editor
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;
