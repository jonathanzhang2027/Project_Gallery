import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { Clock, Calendar } from "lucide-react";
import { Project } from "../utils/types.ts";
import {
  DeleteButton,
} from "../components/projectComponents/Buttons.tsx";
import { useProjectOperations } from "../utils/api.ts";
import SearchBar from "../components/SearchBar.tsx";
interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}
const ProjectList = ({ projects, isLoading }: ProjectListProps) => {
  if (isLoading) {
    return <div>Loading projects...</div>;
  }
  const ProjectHeader = () => {
    return (
      <div className="grid grid-cols-12 gap-4 items-center py-3 rounded-md transition-colors duration-150">
        <div className="col-span-3 text-left">Name</div>
        <div className="col-span-4 text-left">Description</div>
        <div className="col-span-2 text-left flex">
          Last Updated <Clock size={14} className="m-1" />
        </div>
        <div className="col-span-2 text-left flex ">
          Created <Calendar size={14} className="m-1 " />{" "}
        </div>
        <div className="col-span-1 text-left flex "> </div>
      </div>
    );
  };
  const ProjectItem = ({ project }: { project: Project }) => {
    const { handleProjectDelete } = useProjectOperations(project.id);
    return (
      <div className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-50 rounded-md transition-colors duration-150">
        <div className="col-span-3">
          <h3 className="text-left font-medium text-blue-800 hover:underline truncate">
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </h3>
        </div>
        <div className="col-span-4 text-sm text-left text-gray-500 truncate">
          {project.description}
        </div>
        <div className="col-span-2 flex items-center text-xs text-gray-400">
          <span className="truncate">
            {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
        <div className="col-span-2 flex items-center text-xs text-gray-400">
          <span className="truncate">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
        <DeleteButton onClick={handleProjectDelete} className="mx-2" />
      </div>
    );
  };

  return (
    <div className="bg-gray-100 container mx-auto px-4 py-4">
      <div className="divide-y divide-gray-200">
        {/* Header row */}
        <ProjectHeader />

        {projects.length === 0 ? (
          <p className="text-gray-500 italic py-3">No projects available</p>
        ) : (
          projects.map((project: Project) => (
            <ProjectItem key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
  } = useAuth0();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // search bar will filter results
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Fetch projects using axios and Auth0 token
  const fetchProjects = async (): Promise<Project[]> => {
    // Get the Auth0 token
    const token = await getAccessTokenSilently();
    // console.log("Generated token: ", token);
    const response = await axios.get("http://127.0.0.1:8000/api/projects/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log(response);
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery<Project[]>(
    "projects",
    fetchProjects,
    {
      onSuccess: (projects) => {
        setFilteredProjects(projects);
      },
    }
  );

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }
  if (!isAuthenticated) {
    return <div>Please log in to view your projects.</div>;
  }
  // if (isLoading) {
  //   return <div>Loading projects...</div>;
  // }
  if (isError) {
    return (
      <div>
        Error loading projects:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProjects(data || []); // Show all projects if the query is empty
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(data || []); // Show all projects if the query is empty
    } else {
      const filtered = (data || []).filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  return (
    <div>
      {/* Search bar Section */}
      <section className="mx-auto px-4 py-4">
        <SearchBar
          onSearch={handleSearch}
          onSubmit={handleSearchSubmit} // Handle search on Enter key press
        />
      </section>

      {/* Create Project Section */}
      <section className="bg-gray-100  mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl text-left font-semibold mb-2 text-gray-800">
            Create Project
          </h2>
          <div className="flex justify-center">
            <div className="relative">
              <Link
                to="/new-project"
                className="relative w-48 h-12 flex items-center justify-center group"
              >
                {/* Light blue background */}
                <div className="absolute inset-0 bg-[#a8e9fd] transition-transform duration-300 ease-in-out transform group-hover:scale-105 group-hover:skew-x-[10deg] group-hover:scale-105 group-hover:shadow-lg z-0"></div>

                {/* Text */}
                <div className="relative text-lg font-bold text-[#1d769f] transition-transform duration-300 ease-in-out transform group-hover:scale-105 z-10">
                  New Project
                </div>

                {/* Rhombus border */}
                <div className="absolute inset-0 border-4 border-[#1d769f] transition-transform duration-300 ease-in-out transform group-hover:skew-x-[-10deg] group-hover:scale-105 z-5"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Projects Section */}
      <section className="mx-auto px-4 py-8">
        <h2 className="text-2xl text-left font-semibold mb-6 text-gray-800">
          Projects
        </h2>
        <ProjectList projects={filteredProjects || []} isLoading={isLoading} />
        {/* ensure data is defined before accessing it */}
      </section>
    </div>
  );
};

export default Home;
