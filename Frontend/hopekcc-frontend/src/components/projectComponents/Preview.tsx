import React, { useEffect } from 'react';

interface PreviewProps {
  previewDoc: string;
  onNavigate: (filename: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  previewDoc,
  onNavigate
}) => {
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
    <div className={`transition-all duration-300 ease-in-out w-full ` }>
      <iframe
        className={'w-full h-full'}
        title="Preview"
        srcDoc={previewDoc}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
