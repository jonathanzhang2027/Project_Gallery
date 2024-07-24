import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";

// Define the structure of a project
interface Project {
  id: string;
  title: string;
  description: string;
}

// Dummy data to simulate projects
const dummyProjects: Project[] = [
  { id: "1", title: "Project One", description: "Description of Project One" },
  { id: "2", title: "Project Two", description: "Description of Project Two" },
  {
    id: "3",
    title: "Project Three",
    description: "Description of Project Three",
  },
];
// TESTING ONLY - DELETE LATER - Simulate fetching projects
const fetchProjects = async (): Promise<Project[]> => {
  // Simulate a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyProjects);
    }, 1000); // 1-second delay to simulate loading
  });
};

// // Fetch projects using axios
// const fetchProjects = async (): Promise<Project[]> => {
//   const response = await axios.get("/api/projects"); // Replace with your API endpoint
//   return response.data;
// };

const Home = () => {
  const { data, isLoading, isError, error } = useQuery<Project[]>(
    "projects",
    fetchProjects
  );

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
    <div>
      <h1>Home Page</h1>
      <button>
        <Link to="/new-project">Add New Project</Link>
      </button>
      <div>
        <h2>Projects List</h2>
        <ul>
          {projects.length === 0 ? (
            <li>No projects available</li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <Link to={`/project/${project.id}`}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;
