import React, { useEffect } from 'react';

interface PreviewProps {
  preview: string;
  isCollapsed: boolean;
  onNavigate: (filename: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({ preview, isCollapsed, onNavigate }) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate') {
        onNavigate(event.data.file);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  return (
    <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 overflow-hidden' : 'w-1/2'}`}>
      <iframe
        className={`${isCollapsed ? 'w-0 h-0' : 'w-full h-full'}`}
        title="Preview"
        srcDoc={preview}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};