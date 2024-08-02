import React, { useState, FormEvent } from 'react';

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

interface ButtonProps {
  type: 'button' | 'submit';
  onClick?: () => void;
  className: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ type, onClick, className, children }) => (
  <button
    type={type}
    onClick={onClick}
    className={className}
  >
    {children}
  </button>
);

interface NewProjectProps {
  onCreateProject: (projectName: string, projectDescription: string) => void;
  onCancel: () => void;
}

const NewProject: React.FC<NewProjectProps> = ({ onCreateProject, onCancel }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreateProject(projectName, projectDescription);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
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
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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