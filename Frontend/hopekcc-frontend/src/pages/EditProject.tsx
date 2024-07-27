import React, { useState, useEffect } from 'react';
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
const AddButton = ({onAddbuttonClick}: {onAddbuttonClick: () => void})=> {
  
  return (
    <button className='px-4 py-2 text-black hover:bg-gray-300 mt-2' onClick={onAddbuttonClick}>+</button>
  );

};
const FileDisplayButton = ({filename, onFileSelect, isActive}: 
  {filename: string, onFileSelect: (filename: string) => void, isActive: boolean}) => {
  
  return (
    <button
      className={`px-4 py-2 text-left truncate ${isActive ? 'bg-white' : 'hover:bg-gray-300'}`}
      onClick={() => onFileSelect(filename)}
    >
      {filename}
    </button>
  );
}
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

const FileTabsNavigation = ({ files, activeFile, onFileSelect, onAddFile, isCollapsed }: 
  { files: Dictionary<string>, activeFile: string, onFileSelect: (filename: string) => void, onAddFile: () => void, isCollapsed: boolean}) => {
    // {`bg-white transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'w-0 overflow-hidden' : 'w-1/2'}`}
    return (
    <div className={`flex flex-col bg-gray-200 transition-all duration-300 ease-in-out ${isCollapsed? 'w-0 overflow-hidden' : 'w-64 overflow-y-auto'}`}>
      
      {Object.keys(files).map((filename) => (
        <FileDisplayButton filename={filename} onFileSelect={onFileSelect} isActive={activeFile === filename}/>
      ))}
      <AddButton onAddbuttonClick={onAddFile}/>

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
  const [files, setFiles] = useState<Files>(templateFiles
    );
  const [activeFile, setActiveFile] = useState('index.html');
  const [preview, setPreview] = useState('');
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState(false);

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
  
  const handleNavigate = (filename: string) => {
    if (files[filename]) {
      setActiveFile(filename);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        <FileTabsNavigation
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onAddFile={addNewFile}
          isCollapsed={isCollapsedFileTab}/>

        <CollapseButton
          onCollapseButtonClick={() => setIsCollapsedFileTab(!isCollapsedFileTab)}
          isCollapsed={isCollapsedFileTab}
          collapseDirection="left"/>

        <Editor files={files} activeFile={activeFile} onFileChange={handleFileChange}/>

        <CollapseButton
          onCollapseButtonClick={() => setIsCollapsedPreview(!isCollapsedPreview)}
          isCollapsed={isCollapsedPreview}
          collapseDirection="right"/>
        
    
        <Preview preview={preview} isCollapsed={isCollapsedPreview} onNavigate={handleNavigate}/>
        
      </div>
    </div>
  );
};

export default ProjectEditor;