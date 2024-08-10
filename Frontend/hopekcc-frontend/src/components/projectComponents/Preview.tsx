import React, { useEffect } from 'react';
import {SwitchViewButton } from './buttons';

interface PreviewProps {
  previewDoc: string;
  onSwitchView : () => void;
  isCollapsed: boolean;
  onNavigate: (filename: string) => void;
  isEditing: boolean;
}
interface PreviewToolbarProps {
  isEditing: boolean;
  onSwitchView: () => void;
}

export const Preview: React.FC<PreviewProps> = ({isEditing, previewDoc: preview, isCollapsed, onNavigate, onSwitchView }) => {
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
    <>
      
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 overflow-hidden' : 'w-full'}`}>
        <PreviewToolbar isEditing={isEditing} onSwitchView={onSwitchView}/>
        <iframe
          className={`${isCollapsed ? 'w-0 h-0' : 'w-full h-full'}`}
          title="Preview"
          srcDoc={preview}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </>
  );
};


const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  isEditing,
  onSwitchView,
}) => {
  return (
    <div className='w-full text-black bg-gray-300 flex justify-end'>
      <SwitchViewButton isEditing={isEditing} onClick={onSwitchView} className='hover:bg-gray-500'/>
      
    </div>
  );
};