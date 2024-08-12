import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import UserInfo from "../components/UserInfo";
// Define the structure of a project
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// // Dummy data to simulate projects
// const dummyProjects: Project[] = [
//   { id: "1", title: "Project One", description: "Description of Project One" },
//   { id: "2", title: "Project Two", description: "Description of Project Two" },
//   {
//     id: "3",
//     title: "Project Three",
//     description: "Description of Project Three",
//   },
// ];
// // TESTING ONLY - DELETE LATER - Simulate fetching projects
// const fetchProjects = async (): Promise<Project[]> => {
//   // Simulate a delay
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(dummyProjects);
//     }, 300); // 0.3-second delay to simulate loading
//   });
// };

const Home = () => {
  const {
    user,
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
    return response.data.projects;
  };

  const { data, isLoading, isError, error } = useQuery<Project[]>(
    "projects",
    fetchProjects
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
    <div>
      
      {isAuthenticated && (
        // Display user information if authenticated and exists
        <pre style={{ textAlign: "start" }}>
          {user && <UserInfo user={user}/>} 
        </pre>
      )} 
      
      <div>
        <h2>Projects List</h2>
        <ul>
          {projects.length === 0 ? (
            <li>No projects available</li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <Link to={`/project/${project.id}`}>
                  <h3>{project.name}</h3>
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
