import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { Clock, Calendar } from 'lucide-react';
// Define the structure of a project
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const ProjectList = ({ projects }: { projects: Project[] }) => {
  const ProjectHeader = () => {
    return (
      <div className="grid grid-cols-12 gap-4 items-center py-3 rounded-md transition-colors duration-150">
        <div className="col-span-3 text-left">Name</div>
        <div className="col-span-5 text-left">Description</div>
        <div className="col-span-2 text-left flex">Last Updated <Clock size={14} className="m-1" /></div>
        <div className="col-span-2 text-left flex ">Created <Calendar size={14} className="m-1 " /> </div>
      </div>
    );
  };
  const ProjectItem = ({project}: {project: Project}) => {
    return (
    <div key={project.id} className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-50 rounded-md transition-colors duration-150">
      <div className="col-span-3">
        <h3 className="text-left font-medium text-blue-800 hover:underline truncate">
          <Link to={`/projects/${project.id}`}>
            {project.name}
          </Link>
        </h3>
      </div>
      <div className="col-span-5 text-sm text-left text-gray-500 truncate">
        {project.description}
      </div>
      <div className="col-span-2 flex items-center text-xs text-gray-400">
  
        <span className="truncate">{new Date(project.updated_at).toLocaleDateString()}</span>
      </div>
      <div className="col-span-2 flex items-center text-xs text-gray-400">
        <span className="truncate">{new Date(project.created_at).toLocaleDateString()}</span>
      </div>
    </div>
    )
  }
  
  
  return (
      <div className="bg-white container mx-auto px-4 py-4">
        <div className="divide-y divide-gray-200">
          {/* Header row */}
          <ProjectHeader />

          {projects.length === 0 ? (
            <p className="text-gray-500 italic py-3">No projects available</p>
          ) : (
            projects.map((project: Project) => (
              <ProjectItem key={project.id} project = {project} />
            ))
          )}
        </div>
      </div>
    );
}

const Home = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
  } = useAuth0();
  // Fetch projects using axios and Auth0 token
  const fetchProjects = async (): Promise<Project[]> => {
    // Get the Auth0 token
    const token = await getAccessTokenSilently();
    // Fetch projects from the backend - REPLACE WITH SERVER LATER
    const response = await axios.get("http://127.0.0.1:8000/api/projects/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data;
  };
  
  const { data, isLoading, isError, error } = useQuery<Project[]>(
    "projects",
    fetchProjects,
    { // Only fetch projects if the user is authenticated otherwise it won't fetch
      enabled: isAuthenticated,
    }
  );
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }
  if (!isAuthenticated) {
    return <div>Please log in to view your projects.</div>;
  }
  if (isLoading) {
    return <div>Loading projects...</div>;
  }
  if (isError) {
    return (
      <div>
        Error loading projects:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
  // Ensure `data` is defined before accessing it
  const projects = data || [];
  return (
    <div className="bg-gray-100  mx-auto px-4 py-8">
      <h2 className="text-2xl text-left font-semibold mb-6 text-gray-800">Projects</h2>
      <ProjectList projects={projects} />
    </div>
  );
};

export default Home;


