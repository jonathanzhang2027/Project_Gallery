import { useParams } from "react-router-dom";

const Project = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Project Page for {id}</h1>
      {/* Display project details, folders, and files */}
    </div>
  );
};

export default Project;
