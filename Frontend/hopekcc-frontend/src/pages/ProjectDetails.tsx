import React from "react";
import { useParams } from "react-router-dom";
import ProjectHeader from "../components/projectComponents/ProjectHeader";
import ProjectMetadata from "../components/projectComponents/ProjectMetadata";
import ProjectFileList from "../components/projectComponents/ProjectFilelist";
import { useProjectDetail } from "../utils/api";
import { mapProject } from "../utils/mappers";
const ProjectDetail: React.FC = () => {
  /*
  Fetching project Data from the API and displaying it in the ProjectDetail component.
  Only file url will be fetched but not the whole file itself
  */
  const { id } = useParams<{ id: string }>();
  const ProjectId = Number(id);
  if (!ProjectId) {
    return <div>No project id found.</div>;
  }
  const { data, isLoading, error } = useProjectDetail(ProjectId);
  const project = data ? mapProject(data) : null;

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
    <div className="container bg-gray-100 mx-auto px-4 py-8 mt-8">
      <div className="bg-white shadow rounded-lg p-6">
        <ProjectHeader projectName={project.name} projectId={project.id} />

        <ProjectMetadata
          description={project.description}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
          fileCount={project.files.length}
        />

        <ProjectFileList project={project} />
      </div>
    </div>
  );
};

export default ProjectDetail;
