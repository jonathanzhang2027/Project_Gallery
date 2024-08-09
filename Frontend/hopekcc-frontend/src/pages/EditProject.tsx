import React, { useState, useEffect } from 'react';
import { templateFiles, Files } from '../components/projectComponents/templateFiles';
import { FileTabsNavigation } from '../components/projectComponents/FileTabsNavigation';
import { Editor } from '../components/projectComponents/Editor';
import { Preview } from '../components/projectComponents/Preview';
import { CollapseButton } from '../components/projectComponents/buttons';
import { ProjectNavBar } from '../components/NavBar';
import { ProjectDescription } from '../components/projectComponents/projectMeta/ProjectDescription';
const ProjectEditor: React.FC = () => {
  const [files, setFiles] = useState<Files>(templateFiles);
  const [description, setDescription] = useState<string>('Descriptions');
  const [activeFile, setActiveFile] = useState('index.html');
  const [preview, setPreview] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState(false);
  const [isCollapsedDesc, setIsCollapsedDesc] = useState(true);


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

  const handleUpload = () => {
    console.log("uploading files")
  }

  const EditorMode = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        <FileTabsNavigation
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onAddFile={addNewFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
          isCollapsed={isCollapsedFileTab} 
          onUploadFile={handleUpload}        />

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
    
        <Preview isEditing={isEditing} onSwitchView={() => setIsEditing(!isEditing)} previewDoc={preview} isCollapsed={isCollapsedPreview} onNavigate={handleNavigate}/>
      </div>
    </div>
    )
  }
  const ViewMode = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        <Preview  isEditing={isEditing} onSwitchView={() => setIsEditing(!isEditing)}previewDoc={preview} isCollapsed={isCollapsedPreview} onNavigate={handleNavigate}/>
      </div>
    </div>
    )
  }
  return (
    <>
    <ProjectNavBar isEditing={isEditing} title={''} modifiedTime={''} Description={''} 
      onCollapseDesc={() => setIsCollapsedDesc(!isCollapsedDesc)} onSwitchView={() => setIsEditing(!isEditing)}/>
    {isCollapsedDesc? <> </>: <ProjectDescription description={description} onDescriptionChange={setDescription}/>}
    {isEditing ? <EditorMode/> : <ViewMode/>}
    </>
  );
};



export default ProjectEditor;