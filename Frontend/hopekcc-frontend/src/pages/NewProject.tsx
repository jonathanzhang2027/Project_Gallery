import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {Button} from '../components/projectComponents/Buttons';
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      required={required}
    />
  </div>
);

interface TextAreaFieldProps extends InputFieldProps {
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ id, label, value, onChange, rows = 3 }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      rows={rows}
    />
  </div>
);

const NewProject: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/create_project/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating project:', errorData);
        // Handle form errors, e.g., show error messages
        return;
      }
  
      const data = await response.json();
      console.log('Project created successfully with ID:', data.project_id);
      // Handle success, e.g., redirect to the project's detail page or show a success message

      navigate(`/edit-project/${data.project_id}`)
  
    } catch (error) {
      console.error('Network error:', error);
      // Handle network errors, e.g., show a notification
    }
  };

  const handleCancel = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 ">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            id="projectName"
            label="Project Name"
            value={projectName}
            onChange={setProjectName}
            required
          />
          <TextAreaField
            id="projectDescription"
            label="Project Description"
            value={projectDescription}
            onChange={setProjectDescription}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-gray-400 text-gray-800 rounded hover:bg-gray-500"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;