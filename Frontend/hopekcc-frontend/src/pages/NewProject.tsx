import { useNavigate } from "react-router-dom";

const NewProject = () => {
  const navigate = useNavigate();

  const saveProject = () => {
    // Save project logic here
    navigate("/home");
  };

  const saveAndReturnHome = () => {
    // Save project logic here
    navigate("/home");
  };

  return (
    <div>
      <h1>New Project Page</h1>
      {/* Form for adding project folders/files */}
      <button onClick={saveProject}>Save</button>
      <button onClick={saveAndReturnHome}>Save and Return Home</button>
    </div>
  );
};

export default NewProject;

