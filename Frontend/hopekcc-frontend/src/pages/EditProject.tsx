import React, { useState, useEffect } from 'react';
import { FileData, Files } from '../components/projectComponents/templateFiles';
import { FileTabsNavigation } from '../components/projectComponents/FileTabsNavigation';
import { Editor } from '../components/projectComponents/Editor';
import { Preview } from '../components/projectComponents/Preview';
import { CollapseButton } from '../components/projectComponents/Buttons';
import { ProjectNavBar } from '../components/NavBar';
import { ProjectDescription } from '../components/projectComponents/ProjectDescription';
import { useParams } from 'react-router-dom';


interface ProjectData {
  id: number;
  project_name: string;
  project_description: string;
  files: FileData[];
}

const ProjectEditor: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [files, setFiles] = useState<Files>({});
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [modifiedTime, setModifiedTime] = useState<string>('2024')
  const [activeFile, setActiveFile] = useState('index.html');
  const [preview, setPreview] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState<boolean>(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState<boolean>(false);
  const [isCollapsedDesc, setIsCollapsedDesc] = useState<boolean>(true);


  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    generatePreview();
  }, [files, activeFile]);



  // fetch project details when component mounts
  const fetchProjectData = async () => {

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/project_details/${projectId}/`); // Temporary
      if (!response.ok) throw new Error('Network response was not ok');

      const data : ProjectData  = await response.json();
      
      setTitle(data.project_name);
      setDescription(data.project_description);
      
      const fileContents: Files = {};
      data.files.forEach(file => {
        fileContents[file.file_name] = file;
      });

      setActiveFile(data.files[0]?.file_name || '');

      setFiles(fileContents);
      console.log(`Fetched project data: ${data.project_name} ${data.project_description}`);


    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const generatePreview = () => {
    const htmlContent = files[activeFile]?.content || '';
    const cssContent = files['styles.css']?.content || '';
    const jsFiles = Object.keys(files).filter(file => file.endsWith('.js'));
    const jsContent = jsFiles.map(file => files[file].content).join('\n');

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
    const updatedFiles = { ...files, [activeFile]: { ...files[activeFile], content: e.target.value } };
    setFiles(updatedFiles);
  };

  const addNewFile = () => {
    const fileName = prompt('Enter the name of the new file:');
    if (fileName && !files[fileName]) {
      const newFile: FileData = { id: 0, file_name: fileName, content: '' }; // TEMPORARY
      setFiles({ ...files, [fileName]: newFile });
      setActiveFile(fileName);
    } else if (fileName !== null && files[fileName]) {
      alert('A file with this name already exists.');
    }
  };

  const deleteFile = async (fileId: number, filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        const url = `http://localhost:8000/api/delete_file/${projectId}/${fileId}/`;
        console.log(`Deleting file using URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete file: ${response.statusText}`);
        }

        fetchProjectData();
    } catch (error) {
        console.error('Error deleting file:', error);
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
  const handleRenameTitle = (oldTitle:string, newTitle:string) => {
    // if (!newTitle && oldTitle === newTitle){
    //   return;
    // }
    setTitle(newTitle)
    console.log(oldTitle, newTitle)
  }
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
        { !isCollapsedFileTab && <FileTabsNavigation
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onAddFile={addNewFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
          onUploadFile={handleUpload}        />}

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

        {!isCollapsedPreview &&  
          <Preview 
            previewDoc={preview} 
            onNavigate={handleNavigate}/>}
      </div>
    </div>
    )
  }
  const ViewMode = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        <Preview  
          previewDoc={preview} 
          onNavigate={handleNavigate}/>
      </div>
    </div>
    )
  }
  return (
    <>
    <ProjectNavBar isEditing={isEditing} title={title} onTitleChange={handleRenameTitle} modifiedTime={modifiedTime} Description={description} 
      onCollapseDesc={() => setIsCollapsedDesc(!isCollapsedDesc)} onSwitchView={() => setIsEditing(!isEditing)}/>
    {isCollapsedDesc? <> </>: <ProjectDescription description={description} onDescriptionChange={setDescription}/>}
    {isEditing ? <EditorMode/> : <ViewMode/>}
    </>
  );
};



export default ProjectEditor;