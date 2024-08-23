import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FileTabsNavigation } from "../components/projectComponents/FileTabsNavigation";
import { Editor } from "../components/projectComponents/Editor";
import { Preview } from "../components/projectComponents/Preview";
import { CollapseButton } from "../components/projectComponents/Buttons";
import { ProjectNavBar } from "../components/NavBar";
import { ProjectDescription } from "../components/projectComponents/ProjectDescription";
import { useParams } from "react-router-dom";


import { Project, File} from "../utils/types" 
import { useProjectDetail, useMultipleFileDetails, useProjectOperations} from '../utils/api';
import { useFileOperations } from '../utils/api';
import {mapProject, mapFile} from "../utils/mappers";


const generatePreview = (files: File[], activeFileID: File["id"]): string => {
  const activeFile = files.find((file) => file.id === activeFileID);
  if (!activeFile) return '';

  const fileExtension = activeFile.file_name.split('.').pop()?.toLowerCase();
  switch (fileExtension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image Preview</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="data:image/${fileExtension};base64,${activeFile.content}" alt="Preview">
          </body>
        </html>
      `;

    case 'pdf':
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PDF Preview</title>
            <style>
              body { margin: 0; height: 100vh; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="data:application/pdf;base64,${activeFile.content}" type="application/pdf"></iframe>
          </body>
        </html>
      `;

    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document Preview</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; }
              .preview-placeholder { text-align: center; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="preview-placeholder">
              <h2>${activeFile.file_name}</h2>
              <p>Preview not available for ${fileExtension.toUpperCase()} files.</p>
              <p>File size: ${(activeFile.content?.length ?? 0 * 3 / 4 / 1024).toFixed(2)} KB</p>
            </div>
          </body>
        </html>
      `;

      case 'html':
        const cssFiles = files.filter((file) => file.file_name.endsWith(".css"));
        const jsFiles = files.filter((file) => file.file_name.endsWith(".js"));
        const cssContent = cssFiles.map(file => file.content).join('\n');
        const jsContent = jsFiles.map(file => file.content).join('\n');
        
        // Add image handling for HTML files
        const imageFiles = files.filter((file) => 
          ['jpg', 'jpeg', 'png', 'gif'].includes(file.file_name.split('.').pop()?.toLowerCase() || '')
        );
        const imageMap = imageFiles.reduce((acc, file) => {
          acc[file.file_name] = `data:image/${file.file_name.split('.').pop()};base64,${file.content}`;
          return acc;
        }, {} as Record<string, string>);
  
        const modifiedHtmlContent = activeFile.content?.replace(
          /<img\s+src="([^"]+)"/g, 
          (_, src) => `<img src="${imageMap[src] || src}"`
        );
        
        return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Project Preview</title>
              <style>${cssContent}</style>
              <script>
                document.addEventListener('click', function(e) {
                  if (e.target.tagName === 'A' && e.target.href) {
                    e.preventDefault();
                    const filename = e.target.getAttribute('href');
                    window.parent.postMessage({ type: 'navigate', file: filename }, '*');
                  }
                });
              </script>
            </head>
            <body>
              ${modifiedHtmlContent}
              <script>${jsContent}</script>
            </body>
          </html>
        `;

    default:
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Preview</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; }
              pre { white-space: pre-wrap; word-wrap: break-word; max-width: 80%; }
            </style>
          </head>
          <body>
            <pre>${activeFile.content}</pre>
          </body>
        </html>
      `;
  }

};

const ProjectEditorContainer: React.FC = () => {
  //lifting up Fetching logic to escape from constant rendering
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { data: projectData, isLoading: isProjectLoading } = useProjectDetail(projectId);
  const project = projectData ? mapProject(projectData) : null;
  const fileIds = useMemo(() => project?.files?.map(file => file.id) || [], [project?.files]);

  const fileQueries = useMultipleFileDetails(fileIds);

  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const updateLocalFiles = useCallback((newFiles: File[]) => {
    setLocalFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      let hasChanges = false;
      newFiles.forEach((newFile) => {
        const index = updatedFiles.findIndex((file) => file.id === newFile.id);
        if (index !== -1) {
          if (JSON.stringify(updatedFiles[index]) !== JSON.stringify(newFile)) {
            updatedFiles[index] = newFile;
            hasChanges = true;
          }
        } else {
          updatedFiles.push(newFile);
          hasChanges = true;
        }
      });
      return hasChanges ? updatedFiles : prevFiles;
    });
  }, []);


  React.useEffect(() => {
    const successfulQueries = fileQueries.filter(query => query.isSuccess && query.data);

  
    if (successfulQueries.length > 0) {
      const newFiles = successfulQueries.map((query) => mapFile(query.data));
      updateLocalFiles(newFiles);
    }
  }, [fileQueries, updateLocalFiles]);


  if (isProjectLoading || fileQueries.some(query => query.isLoading)) {
    return <div>Loading...</div>;
  }

  return (
    <ProjectEditor
      project={project}
      files={localFiles}
      updateLocalFiles={updateLocalFiles}
    />
  );
};



interface ProjectEditorProps {
  project: Project | null;
  files: File[];
  updateLocalFiles: (newFiles: File[]) => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, files, updateLocalFiles }) => {
  const [localFiles, setLocalFiles] = useState<File[]>(files || []);
  const [activeFileID, setActiveFileID] = useState(files[0]?.id || 0);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isCollapsedFileTab, setIsCollapsedFileTab] = useState<boolean>(false);
  const [isCollapsedPreview, setIsCollapsedPreview] = useState<boolean>(false);
  const [isCollapsedDesc, setIsCollapsedDesc] = useState<boolean>(true);
  const [error, setError] = useState<string | null | Error>(null);

  const [saveMsg, setSaveMsg] = useState<string>('ctrl-s to save the file')
  const { handleProjectRename, handleProjectChangeDescription, error: projectError } = useProjectOperations(project?.id || 0);
  if (projectError) {
    setError(projectError);
  }
  const { handleFileSave } = useFileOperations(project?.id || 0);
  if (!project){
    return (
      <>
    <div>missing projects</div>
    {error && typeof error !== 'string' && <div>{error.message}</div>}
    {error && typeof error === 'string' && <div>{error}</div>}
    </>
    )
    
  }
  useEffect(() => {
    
    setLocalFiles(files);
  },[files]);


  const preview = useMemo(() => {
    if (localFiles && localFiles.length > 0) {
      return generatePreview(localFiles, activeFileID);
    }
    return "";
  }, [localFiles, activeFileID]);

  const handleNavigate = (filename: string) => {
    const file = localFiles.find((file) => file.file_name === filename);
    if (file) {
      setActiveFileID(file.id);
    }

  };

  const handlFileselect = (fileId: number) => {
    setActiveFileID(fileId)
    setSaveMsg('')

  }
  
  const onSave = useCallback(async (content: string) => {
    const updatedFiles = localFiles.map(file => {
      if (file.id === activeFileID) {
        return { ...file, content };
      } else {
        return file;
      }
    });
    setLocalFiles(updatedFiles);
    setSaveMsg('Saving...')
    try {
      await handleFileSave(activeFileID, content);
      setSaveMsg('File saved successfully')
    } catch (e: any) {
      setError(e.message);
      setSaveMsg('Failed to save the file...Please try again later')
    }
  }, [activeFileID, localFiles, handleFileSave, updateLocalFiles]);

  const handleChange = useCallback((content: string) => {
    const updatedFiles = localFiles.map(file => {
      if (file.id === activeFileID) {
        return { ...file, content };
      } else {
        return file;
      }
    });
    setLocalFiles(updatedFiles);
  }, [activeFileID, localFiles]);
  return (
    <>
    <ProjectNavBar isEditing={isEditing} title={project?.name || ''} onTitleChange={handleProjectRename} modifiedTime={project?.updated_at || 'NaN'}
      onCollapseDesc={() => setIsCollapsedDesc(!isCollapsedDesc)} onSwitchView={() => setIsEditing(!isEditing)}/>
    {isCollapsedDesc? <> </>: <ProjectDescription description={project?.description || ''} onDescriptionChange={handleProjectChangeDescription}/>}
    
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow flex">
        {isEditing && //Editor mode
          <> 
            { !isCollapsedFileTab && <FileTabsNavigation
              projectId={project.id}
              files={project?.files || []}
              activeFileID={activeFileID}
              onFileSelect={handlFileselect}
              onError={setError}/>}

            <CollapseButton
              onCollapseButtonClick={() => setIsCollapsedFileTab(!isCollapsedFileTab)}
              isCollapsed={isCollapsedFileTab}
              collapseDirection="left"
            />
          
            <Editor activeFile={localFiles.find(file => file.id === activeFileID)} 
              onSave={onSave} onChange={handleChange} message={saveMsg}/>

            <CollapseButton
              onCollapseButtonClick={() =>
                setIsCollapsedPreview(!isCollapsedPreview)
              }
              isCollapsed={isCollapsedPreview}
              collapseDirection="right"
            />
          </>
        }

          {!isCollapsedPreview && (
            <Preview previewDoc={preview} onNavigate={handleNavigate} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectEditorContainer;
