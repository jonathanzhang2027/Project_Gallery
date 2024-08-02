import React, { useState, useEffect, useRef  } from 'react';

const templateFiles = {
  'index.html': `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home Page</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <nav>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
        </nav>
        <h1>Welcome to My Project</h1>
        <p>This is the home page.</p>
        <script src="main.js"></script>
        <script src="utils.js"></script>
    </body>
    </html>`,

  'about.html': `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>About Page</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <nav>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
        </nav>
        <h1>About Us</h1>
        <p>This is the about page.</p>
        <p>Counter: <span id="counter">0</span></p>
        <button id="incrementBtn">Increment</button>
        <script src="main.js"></script>
        <script src="utils.js"></script>
    </body>
    </html>`,

  'styles.css': `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
  }

  h1 {
    color: #333;
  }

  nav {
    margin-bottom: 20px;
  }

  nav a {
    margin-right: 10px;
  }`,

  'main.js': `console.log('Main script loaded');

  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const counterElement = document.getElementById('counter');
    const incrementBtn = document.getElementById('incrementBtn');

    if (incrementBtn && counterElement) {
      let count = 0;

      incrementBtn.addEventListener('click', () => {
        count = incrementValue(count);
        counterElement.textContent = count;
      });
    }
  });`,

  'utils.js': `function getCurrentTime() {
    return new Date().toLocaleTimeString();
  }

  function incrementValue(value) {
    return value + 1;
  }

  console.log('Current time:', getCurrentTime());`,
};
interface Dictionary<T> {
  [Key: string]: T;
}
interface Files {
  [key: string]: string;
}
const AddButton = ({OnAdd}: {OnAdd: () => void})=> {
  
  return (
    <button className='px-4 py-2 text-black hover:bg-gray-300 mt-2' onClick={OnAdd}>+</button>
  );

};

const FileDisplayButton = ({
  filename,
  onFileSelect,
  onRename,
  isActive
}: {
  filename: string,
  onFileSelect: (filename: string) => void,
  onRename: (oldName: string, newName: string) => void,
  isActive: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(filename);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (newName && newName !== filename) {
      onRename(filename, newName);
    } else {
      setNewName(filename);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div
      className={`flex-grow px-4 py-2 text-left truncate ${
        isActive ? 'bg-white' : 'hover:bg-gray-300'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0 border rounded"
        />
      ) : (
        <button
          className="w-full text-left"
          onClick={() => onFileSelect(filename)}
        >
          {filename}
        </button>
      )}
    </div>
  );
};

const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button className="px-2 py-1 text-red-600 hover:bg-red-100" onClick={onDelete}>
      -
    </button>
  );
};

const CollapseButton = ({onCollapseButtonClick, isCollapsed, collapseDirection}: 
  {onCollapseButtonClick: () => void, isCollapsed: boolean, collapseDirection: string}) => {
  const getCollapseIcon = () => {
    switch (collapseDirection) {
      case 'left':
        return isCollapsed ? '>' : '<';
      case 'right':
        return isCollapsed ? '<' : '>';
      default:
        return isCollapsed ? '<' : '>';
    }
  };
  return (
    <button className='px-1 py-1 text-black bg-gray-300 hover:bg-gray-500' onClick={onCollapseButtonClick}>
      {getCollapseIcon()}
    </button>
  );
}


const FileTabsNavigation = ({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  isCollapsed
}: {
  files: Dictionary<string>,
  activeFile: string,
  onFileSelect: (filename: string) => void,
  onAddFile: () => void,
  onDeleteFile: (filename: string) => void,
  onRenameFile: (oldName: string, newName: string) => void,
  isCollapsed: boolean
}) => {
  return (
    <div
      className={`flex flex-col bg-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-64 overflow-y-auto'
      }`}
    >
      {Object.keys(files).map((filename) => (
        <div key={filename} className="flex items-center">
          <FileDisplayButton
            filename={filename}
            onFileSelect={onFileSelect}
            onRename={onRenameFile}
            isActive={activeFile === filename}
          />
          <DeleteButton onDelete={() => onDeleteFile(filename)} />
        </div>
      ))}
      <AddButton OnAdd={onAddFile} />
    </div>
  );
};

const ProjectTitle = ({ title, onTitleChange }: { title: string; onTitleChange: (newTitle: string) => void }) => {
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

const DescriptionToggleButton = ({ isEditing, onClick }: { isEditing: boolean; onClick: () => void }) => (
  <button
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center"
    onClick={onClick}
  >
    {isEditing ? (
      <>
        <span className="ml-1">Hide Description</span>
      </>
    ) : (
      <>
        <span className="ml-1">Show Description</span>
      </>
    )}
  </button>
);

const ProjectDescription = ({ description, onDescriptionChange }: { description: string; onDescriptionChange: (newDescription: string) => void }) => (
  <textarea
    className="w-full p-2 border rounded mt-2"
    value={description}
    onChange={(e) => onDescriptionChange(e.target.value)}
    placeholder="Project Description"
    rows={3}
  />
);

const ProjectMetadata = ({ title, description, onTitleChange, onDescriptionChange }: 
  { title: string, description: string, onTitleChange: (newTitle: string) => void, onDescriptionChange: (newDescription: string) => void }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <div className="bg-white p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <ProjectTitle title={title} onTitleChange={onTitleChange} />
        <DescriptionToggleButton 
          isEditing={isEditingDescription} 
          onClick={() => setIsEditingDescription(!isEditingDescription)} 
        />
      </div>
      {isEditingDescription && (
        <ProjectDescription description={description} onDescriptionChange={onDescriptionChange} />
      )}
    </div>
  );
};

const Editor = ({files, activeFile, onFileChange}: {files: Dictionary<string>, activeFile: string, onFileChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void}) => {

  return (
    <textarea
      className="w-full h-full p-2 font-mono text-sm resize-none"
      value={files[activeFile] || ''}
      onChange={onFileChange}
    />
  );
}
const Preview = ({ preview, isCollapsed, onNavigate }: { preview: string, isCollapsed: boolean, onNavigate: (filename: string) => void }) => {
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


const ProjectEditor = () => {
  const [files, setFiles] = useState<Files>(templateFiles);
  const [activeFile, setActiveFile] = useState('index.html');
  const [preview, setPreview] = useState('');
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState(false);
  const [projectTitle, setProjectTitle] = useState('My Project');
  const [projectDescription, setProjectDescription] = useState('A simple web project');

  useEffect(() => {
    generatePreview();
  }, [files, activeFile]);

  const generatePreview = () => {
    const htmlContent = files[activeFile] || '';
    const cssContent = files['styles.css'] || '';
    const jsFiles = Object.keys(files).filter(file => file.endsWith('.js'));
    const jsContent = jsFiles.map(file => files[file]).join('\n');

    const combinedCode = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${activeFile}</title>
          <style>${cssContent}</style>
          <base target="_self">
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
          <script>
            // Handle navigation within the preview
            document.body.addEventListener('click', (e) => {
              if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                const fileName = e.target.href.split('/').pop();
                window.parent.postMessage({ type: 'navigate', file: fileName }, '*');
              }
            });
          </script>
        </body>
      </html>
    `;
    setPreview(combinedCode);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedFiles = { ...files, [activeFile]: e.target.value };
    setFiles(updatedFiles);
  };

  const addNewFile = () => {
    const fileName = prompt('Enter the name of the new file:');
    if (fileName && !files[fileName]) {
      setFiles({ ...files, [fileName]: '' });
      setActiveFile(fileName);
    } else if (fileName !== null && files[fileName]) {
      alert('A file with this name already exists.');
    }
  };

  const deleteFile = (filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      const newFiles = { ...files };
      delete newFiles[filename];
      setFiles(newFiles);
      if (activeFile === filename) {
        setActiveFile(Object.keys(newFiles)[0] || '');
      }
    }
  };

  const renameFile = (oldName: string, newName: string) => {
    if (files[newName]) {
      alert('A file with this name already exists.');
      return;
    }
    const newFiles = { ...files };
    newFiles[newName] = newFiles[oldName];
    delete newFiles[oldName];
    setFiles(newFiles);
    if (activeFile === oldName) {
      setActiveFile(newName);
    }
  };
  
  const handleNavigate = (filename: string) => {
    if (files[filename]) {
      setActiveFile(filename);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ProjectMetadata 
        title={projectTitle}
        description={projectDescription}
        onTitleChange={setProjectTitle}
        onDescriptionChange={setProjectDescription}
      />
      <div className="flex-grow flex">
        <FileTabsNavigation
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onAddFile={addNewFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
          isCollapsed={isCollapsedFileTab}
        />

        <CollapseButton
          onCollapseButtonClick={() => setIsCollapsedFileTab(!isCollapsedFileTab)}
          isCollapsed={isCollapsedFileTab}
          collapseDirection="left"
        />

        <Editor files={files} activeFile={activeFile} onFileChange={handleFileChange}/>

        <CollapseButton
          onCollapseButtonClick={() => setIsCollapsedPreview(!isCollapsedPreview)}
          isCollapsed={isCollapsedPreview}
          collapseDirection="right"
        />
    
        <Preview preview={preview} isCollapsed={isCollapsedPreview} onNavigate={handleNavigate}/>
      </div>
    </div>
  );
};

export default ProjectEditor;