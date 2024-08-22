import React, { useState, useEffect } from "react";

interface ProjectDescriptionProps {
  description: string;
  onDescriptionChange: (newDescription: string) => Promise<boolean>;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  description,
  onDescriptionChange,
}) => {
  const [editedDescription, setEditedDescription] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedDescription(description);
  }, [description]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const success = await onDescriptionChange(editedDescription);
      if (!success) {
        setError("Failed to save changes. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4">
      <textarea
        className="w-full p-2 border rounded"
        value={editedDescription}
        onChange={(e) => setEditedDescription(e.target.value)}
        placeholder="Project Description"
        rows={3}
      />
      <div className="my-2 flex justify-end">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
          onClick={handleSave}
          disabled={isSaving || editedDescription === description}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};
