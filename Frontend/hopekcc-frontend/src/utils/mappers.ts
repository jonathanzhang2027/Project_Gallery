import type { File, Project } from "./types";

// Mapper functions
/**
 * Maps an API response to a File object.
 * 
 * @param data - The API response data.
 * @returns The mapped File object.
 */
function mapApiResponseToFile(data: any): File {
  let decodedContent = data?.content?.content || "";
  
  if (data?.content?.is_base64) {
    const fileExtension = data.file_name.split('.').pop()?.toLowerCase();
    const textExtensions = ['txt', 'html', 'css', 'js', 'json', 'md', 'xml', 'csv'];
    
    if (textExtensions.includes(fileExtension)) {
      // For text files, decode from base64 to UTF-8
      decodedContent = new TextDecoder().decode(Uint8Array.from(atob(decodedContent), c => c.charCodeAt(0)));
    } else {
      // For binary files, keep the base64 content as is
      decodedContent = data.content.content;
    }
  }

  return {
    id: data.id,
    project: data.project,
    file_name: data.file_name,
    file_url: data.file_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    content: decodedContent,
  };
}

function mapApiResponseToProject(data: any): Project {
  return {
    id: data.id,
    auth0_user_id: data.auth0_user_id,
    name: data.name,
    description: data.description,
    created_at: data.created_at,
    updated_at: data.updated_at,
    files: Array.isArray(data.files)
      ? data.files.map(mapApiResponseToFile)
      : [],
  };
}

// Reverse mapper functions
function mapProjectToApiRequest(project: Partial<Project>): any {
  return {
    auth0_user_id: project.auth0_user_id,
    name: project.name,
    description: project.description,
    // Typically, you don't send back created_at and updated_at
    // The API usually manages these fields
  };
}
function mapFileToApiRequest(file: Partial<File>): any {
  const result: any = { ...file };
  if (file.content) {
    // Use a generic name since the actual name doesn't matter for storage
    result.file = new File([file.content], file.file_name || "content");
  }
  return result;
}
// Generic mapper function
function mapApiResponse<T>(data: any, mapperFn: (item: any) => T): T {
  return mapperFn(data);
}

// Usage examples
const mapProject = (data: any) => mapApiResponse(data, mapApiResponseToProject);
const mapFile = (data: any) => mapApiResponse(data, mapApiResponseToFile);

// Function to map an array of items
function mapApiResponseArray<T>(data: any[], mapperFn: (item: any) => T): T[] {
  return data.map((item) => mapperFn(item));
}

// Usage example for array mapping
const mapProjects = (data: any[]) =>
  mapApiResponseArray(data, mapApiResponseToProject);
const mapFiles = (data: any[]) =>
  mapApiResponseArray(data, mapApiResponseToFile);
// Generic reverse mapper function
function mapToApiRequest<T>(
  data: Partial<T>,
  mapperFn: (item: Partial<T>) => any
): any {
  return mapperFn(data);
}

// Usage examples
const mapProjectRequest = (data: Partial<Project>) =>
  mapToApiRequest(data, mapProjectToApiRequest);
const mapFileRequest = (data: Partial<File>) =>
  mapToApiRequest(data, mapFileToApiRequest);

export {
  //mappers
  // mapApiResponseToFile,
  // mapApiResponseToProject,
  // mapApiResponse,
  // mapApiResponseArray,
  mapProject,
  mapFile,
  mapProjects,
  mapFiles,
  mapProjectRequest,
  mapFileRequest,
  mapToApiRequest,
  mapFileToApiRequest,
  mapProjectToApiRequest,
};
