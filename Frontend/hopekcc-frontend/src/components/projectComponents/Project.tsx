import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FileData } from './templateFiles';
import ProjectHeader from './ProjectHeader';
import ProjectMetadata from './ProjectMetadata';
import ProjectFileList from './ProjectFilelist';

interface ProjectData {
  id: number;
  project_name: string;
  project_description: string;
  files: FileData[];
  created_at: string;
  updated_at: string;
}

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ProjectData>(`http://127.0.0.1:8000/api/project_details/${id}/`);
      setProject(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to fetch project data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>No project data found.</div>;
  }

  return (
    <div className="container bg-gray-100 mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <ProjectHeader 
          projectName={project.project_name}
          projectId={project.id}
        />
        
        <ProjectMetadata 
          description={project.project_description}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
          fileCount={project.files.length}
        />

        <ProjectFileList files={project.files} />
      </div>
    </div>
  );
};

export default Project;