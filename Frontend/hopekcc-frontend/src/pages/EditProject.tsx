import React, { useState, useMemo } from 'react';
import { FileTabsNavigation } from '../components/projectComponents/FileTabsNavigation';
import { Editor } from '../components/projectComponents/Editor';
import { Preview } from '../components/projectComponents/Preview';
import { CollapseButton } from '../components/projectComponents/Buttons';
import { ProjectNavBar } from '../components/NavBar';
import { ProjectDescription } from '../components/projectComponents/ProjectDescription';
import { useParams } from 'react-router-dom';

import { File} from "../utils/types" 
import { useProjectDetail, useMultipleFileDetails, useUpdateFile } from '../utils/api';
import {mapProject, mapFile, mapFiles, mapFileRequest} from "../utils/mappers";

const generatePreview = (files: File[], activeFileID :File["id"]): string => {
  const htmlFile = files.find(file => file.id === activeFileID);
  const cssFiles = files.filter(file => file.file_name.endsWith('.css'));
  const jsFiles = files.filter(file => file.file_name.endsWith('.js'));

  const htmlContent = htmlFile ? htmlFile.content : '';
  const cssContent = cssFiles.map(file => file.content).join('\n');
  const jsContent = jsFiles.map(file => file.content).join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Preview</title>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
    </html>
  `;
};

const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id)
  //get real project data
  if (!projectId) {
    return (
      <div>no project id</div>
    )
  }
  const { data } = useProjectDetail(projectId);
  const project = data ? mapProject(data) : null;
  // Use useMemo to create a stable array of file IDs
  const fileIds = useMemo(() => {
    return project?.files?.map(file => file.id) || [];
  }, [project]);
  const { data: files} = useMultipleFileDetails(fileIds);
  const FetchedFiles = files ? mapFiles(files) : [];

  //data for display
  const [title, setTitle] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const modifiedTime = project?.updated_at || '';
  //save when editable files change? TODO
  const [activeFileID, setActiveFileID] = useState(FetchedFiles[0]?.id || 0);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState<boolean>(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState<boolean>(false);
  const [isCollapsedDesc, setIsCollapsedDesc] = useState<boolean>(true);


  const updateFileMutation = useUpdateFile();
  const preview = useMemo(() => {
    if (FetchedFiles && FetchedFiles.length > 0) {
      return generatePreview(FetchedFiles, activeFileID);
    }
    return '';
  }, [FetchedFiles, activeFileID]);


  const handleNavigate = (filename: string) => {
    const file = FetchedFiles.find(file => file.file_name === filename);
    if (file) {
      setActiveFileID(file.id);
    }
  };

  const handleFileSave = async (content: string) => {
    //Saves active file
    const file = FetchedFiles?.find(f => f.id === activeFileID);
    if (!file) {
        setError('File not found');
        return;
    }
    try {
        const updatedFile = { ...file, content };
        const formData = mapFileRequest(updatedFile); 
        await updateFileMutation.mutateAsync({ id: activeFileID, data: formData });
    } catch (err) {
        setError(`Failed to save file ${file.file_name}`);
    }
  };


  const EditorMode = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        { !isCollapsedFileTab && <FileTabsNavigation
            projectId={projectId}
            files={FetchedFiles}
            activeFileID={activeFileID}
            onFileSelect={setActiveFileID}
            onError={setError}/>}

        <CollapseButton
          onCollapseButtonClick={() => setIsCollapsedFileTab(!isCollapsedFileTab)}
          isCollapsed={isCollapsedFileTab}
          collapseDirection="left"
        />

        <Editor files={FetchedFiles} activeFileID={activeFileID} onSave={handleFileSave}/>

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
    <ProjectNavBar isEditing={isEditing} title={title} onTitleChange={setTitle} modifiedTime={modifiedTime} Description={description} 
      onCollapseDesc={() => setIsCollapsedDesc(!isCollapsedDesc)} onSwitchView={() => setIsEditing(!isEditing)}/>
    {isCollapsedDesc? <> </>: <ProjectDescription description={description} onDescriptionChange={setDescription}/>}
    {isEditing ? <EditorMode/> : <ViewMode/>}
    </>
  );
};



export default ProjectEditor;