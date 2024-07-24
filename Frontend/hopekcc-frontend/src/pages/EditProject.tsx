import { useParams, useNavigate } from "react-router-dom";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const saveChanges = () => {
    // Save changes logic here
    navigate("/home");
  };

  return (
    <div>
      <h1>Edit Project Page for {id}</h1>
      {/* Form for editing project details, folders, and files */}
      <button onClick={saveChanges}>Save Changes</button>
    </div>
  );
};

export default EditProject;
