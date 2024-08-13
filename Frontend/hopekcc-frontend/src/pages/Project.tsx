import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileData } from '../components/projectComponents/templateFiles';

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
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Project not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{project.project_name}</h1>
      <p className="text-gray-600 mb-6">{project.project_description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Project Details</h2>
          <p><strong>Created:</strong> {new Date(project.created_at).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(project.updated_at).toLocaleString()}</p>
          <p><strong>Total Files:</strong> {project.files.length}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <Link to={`/project-editor/${id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Open in Editor
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Files</h2>
        <ul className="space-y-2">
          {project.files.map((file) => (
            <li key={file.id} className="flex items-center">
              <span className="mr-2">{getFileIcon(file.file_name)}</span>
              {file.file_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.html')) return '📄';
  if (fileName.endsWith('.css')) return '🎨';
  if (fileName.endsWith('.js')) return '🟨';
  return '📁';
};

export default Project;