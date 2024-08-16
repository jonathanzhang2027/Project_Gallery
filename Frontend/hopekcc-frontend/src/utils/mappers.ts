import type { File, Project, User } from './types';

// Mapper functions
function mapApiResponseToFile(data: any): File {
    return {
        id: data.id,
        project: data.project,
        file_name: data.file_name,
        file_url: data.file_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        file_content: data.file_content
    };
}

function mapApiResponseToUser(data: any): User {
    return {
        id: data.id,
        email: data.email,
        name: data.name,
        // Map other user properties as needed
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
        files: Array.isArray(data.files) ? data.files.map(mapApiResponseToFile) : []
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
    const content = file.file_content || '';
    const file_name = file.file_name || 'new_file.txt';
    return {
        project: file.project,
        file: new File([content], file_name) 
        
        // Typically, you don't send back file_url, created_at, and updated_at
        // The API usually manages these fields
    };
}

// Generic mapper function
function mapApiResponse<T>(data: any, mapperFn: (item: any) => T): T {
    return mapperFn(data);
}

// Usage examples
const mapProject = (data: any) => mapApiResponse(data, mapApiResponseToProject);
const mapFile = (data: any) => mapApiResponse(data, mapApiResponseToFile);
const mapUser = (data: any) => mapApiResponse(data, mapApiResponseToUser);

// Function to map an array of items
function mapApiResponseArray<T>(data: any[], mapperFn: (item: any) => T): T[] {
    return data.map(item => mapperFn(item));
}

// Usage example for array mapping
const mapProjects = (data: any[]) => mapApiResponseArray(data, mapApiResponseToProject);
const mapFiles = (data: any[]) => mapApiResponseArray(data, mapApiResponseToFile);
const mapUsers = (data: any[]) => mapApiResponseArray(data, mapApiResponseToUser);

// Generic reverse mapper function
function mapToApiRequest<T>(data: Partial<T>, mapperFn: (item: Partial<T>) => any): any {
    return mapperFn(data);
}

// Usage examples
const mapProjectRequest = (data: Partial<Project>) => mapToApiRequest(data, mapProjectToApiRequest);
const mapFileRequest = (data: Partial<File>) => mapToApiRequest(data, mapFileToApiRequest);

export {
    //mappers
    mapApiResponseToFile,
    mapApiResponseToUser,
    mapApiResponseToProject,
    mapApiResponse,
    mapApiResponseArray,
    mapProject,
    mapFile,
    mapUser,
    mapProjects,
    mapFiles,
    mapUsers,

    // Reverse mappers
    mapProjectToApiRequest,
    mapFileToApiRequest,
    mapToApiRequest,
    mapProjectRequest,
    mapFileRequest
};