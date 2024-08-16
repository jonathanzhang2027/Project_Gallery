import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectHeader from '../components/projectComponents/ProjectHeader';
import ProjectMetadata from '../components/projectComponents/ProjectMetadata';
import ProjectFileList from '../components/projectComponents/ProjectFilelist';

import { useProjectDetail } from '../utils/api';
import { mapApiResponse, mapApiResponseToProject } from '../utils/mappers';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useProjectDetail(Number(id));
  const project = data ? mapApiResponse(data, mapApiResponseToProject) : null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!project) {
    return <div>No project data found.</div>;
  }

  return (
    <div className="container bg-gray-100 mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <ProjectHeader 
          projectName={project.name}
          projectId={project.id}
        />
        
        <ProjectMetadata 
          description={project.description}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
          fileCount={project.files.length}
        />

        <ProjectFileList
          projectId={project.id} 
          files={project.files}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;