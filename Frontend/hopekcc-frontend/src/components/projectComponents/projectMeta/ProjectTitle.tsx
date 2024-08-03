import React, { useState, useEffect, useRef } from 'react';

interface ProjectTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const ProjectTitle: React.FC<ProjectTitleProps> = ({ title, onTitleChange }) => {
  const [inputWidth, setInputWidth] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      setInputWidth(measureRef.current.offsetWidth);
    }
  }, [title]);

  return (
    <div className="relative inline-block">
      <span
        ref={measureRef}
        className="invisible absolute whitespace-pre px-2"
        style={{ fontWeight: 'bold', fontSize: '1.5rem' }}
      >
        {title || 'Project Title'}
      </span>
      <input
        className="text-2xl font-bold px-2 py-1 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
        style={{ width: `${inputWidth + 20}px` }}  // Add some padding
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Project Title"
      />
    </div>
  );
};