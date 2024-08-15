from django.shortcuts import render, redirect, get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .forms import ProjectForm, FileForm
from .models import Project, File
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from firebase_admin import storage
import requests
from .utils import get_user_id_from_request
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .utils import upload_file_to_gcs, delete_file_from_gcs, get_file_content_from_gcs, update_file_in_gcs
@csrf_exempt
def create_project(request): # CONNECTED TO FRONTEND CREATE PROJECT PAGE
    temp_user = User.objects.get(username='temp_user')  # Placeholder for Auth0 user
    if request.method == 'POST':
        data = json.loads(request.body)
        form = ProjectForm(data)

        if form.is_valid():
            project = form.save(commit=False)
            project.user = temp_user
            project.save()
            return JsonResponse({'status': 'success', 'project_id': project.id}, status=201)

        return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


def upload_file(request, project_id): # NEEDS CONNECTING TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, pk=project_id)
    if request.method == 'POST' and 'file' in request.FILES:
        file = request.FILES['file']
        path = default_storage.save('uploads/' + file.name, ContentFile(file.read()))
        file_url = default_storage.url(path)
        File.objects.create(
            project=project,
            file_name=file.name,
            file_url=file_url
        )
        return render(request, 'api/upload.html', {'project': project, 'file_url': file_url})
    return render(request, 'api/upload.html', {'project': project})



# # listing user projects api endpoint
# def list_user_projects(request):
#     if request.method == 'GET':
#         auth0_user_id = get_user_id_from_request(request)

#         if not auth0_user_id:
#             return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

#         # Retrieve all projects
#         projects = Project.objects.filter(auth0_user_id=auth0_user_id)
#         projects_data = list(projects.values('id', 'name', 'description', 'created_at', 'updated_at'))
        
#         return JsonResponse({'projects': projects_data}, safe=False, status=200)
#     return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


def list_user_projects(request):
    if request.method == 'GET':
        # Retrieve all projects
        projects = Project.objects.all()
        projects_data = list(projects.values('id', 'name', 'description', 'created_at', 'updated_at'))
        
        return JsonResponse({'projects': projects_data}, safe=False, status=200)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)




# for testing backend view only
def display_user_projects_home(request):
    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user') # replace with actual Auth0 check
    projects = Project.objects.filter(user=temp_user)
    return render(request, 'api/home.html', {'projects': projects})


def get_project_details(request, project_id): # CONNECTED TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, id=project_id)
    
    # Placeholder for Auth0 user check
    # temp_user = User.objects.get(username='temp_user')  # Replace with actual Auth0 check
    # if project.auth0_user_id != temp_user:
    #     return JsonResponse({'error': 'Unauthorized action'}, status=403)

    files = project.files.all()
    files_data = []

    bucket = storage.bucket()
    
    for file in files:
        file_content = None
        
        file_path = file.file_url.split(bucket.name + '/')[1].split('?')[0] 
        blob = bucket.blob(file_path)

        if blob.exists():
            file_content = blob.download_as_text()
            files_data.append({
                'id': file.id,
                'file_name': file.file_name,
                'content': file_content,
            })

    project_data = {
        'id': project.id,
        'project_name': project.name,
        'project_description': project.description,
        'files': files_data
    }

    return JsonResponse(project_data)

@csrf_exempt
def delete_file(request, project_id, file_id): # CONNECTED TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, id=project_id)
    file = get_object_or_404(File, id=file_id, project=project)
    
    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user')  # Replace with actual Auth0 check
    if project.user != temp_user:
        return JsonResponse({'error': 'Unauthorized action'}, status=403)
    
    # Delete the file from Google Cloud Storage
    bucket = storage.bucket()
    file_path = file.file_url.split(bucket.name + '/')[1].split('?')[0]  # Extract path
    blob = bucket.blob(file_path)
    blob.delete()  # This deletes the file from Google Cloud Storage
    
    # Delete the file record from the database
    file.delete()
    
    return JsonResponse({'success': True})


'''
#CRUD files
    - view for changing / updating file contents --> file editor
    - view for renaming file (connect to frontend) --> file editor
    - view for creating new empty file --> file editor
    - view for uploading file --> file editor
'''

from .serializers import ProjectSerializer, FileSerializer
from .permissions import IsProjectOwnerOrReadOnly
from rest_framework import viewsets, status, exceptions
from rest_framework.response import Response

class FileViewSet(viewsets.ModelViewSet):
    """
    This ViewSet automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.
    
    For detail views it performs :
    - retrieve
    - update
    - update
    - destroy

    For list views it performs :
    - list
    - create

    Additionally, in detail views it'll retrieve the file content from Google Cloud Storage.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    #TODO Add auth-0 authentication
    # permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        project_id = request.data.get('project')
        if not project_id:
            return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the project exists
        project = Project.objects.filter(id=project_id).first()
        if not project:
            return Response({'error': 'Project does not exist'}, status=status.HTTP_404_NOT_FOUND)

        try:
            file_url = upload_file_to_gcs(file, project_id)
            
            serializer = self.get_serializer(data={
                'project': project_id,
                'file_name': file.name,
                'file_url': file_url
            })
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        try:
            data['content'] = get_file_content_from_gcs(instance.file_url)
            return Response(data)
        except exceptions.NotFound:
            return Response({'error': 'File not found in storage'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """handles both partial and full update"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        file = request.FILES.get('file')

        try:
            # Check if the project is being updated
            if 'project' in request.data:
                project_id = request.data['project']
                # Ensure the new project exists
                get_object_or_404(Project, id=project_id)
            
            if file:
                file_url = update_file_in_gcs(file, instance.file_url)
                request.data['file_url'] = file_url
                request.data['file_name'] = file.name
            else:
                # Remove file_url from request.data if no new file is provided
                request.data.pop('file_url', None)
                
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({'error': 'Project does not exist'}, status=status.HTTP_404_NOT_FOUND)
        except exceptions.NotFound:
            return Response({'error': 'File not found in storage'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            delete_file_from_gcs(instance.file_url)
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''
CRUD projects
    view for changing project title --> file editor
    view for changing project description --> file editor
    view for deleting project --> file editor
    view for creating project --> file editor
'''
class ProjectViewSet(viewsets.ModelViewSet):
    """
    This ViewSet automatically provides `list`, `create`, `update` and `destroy` actions.
    We override the `retrieve` action to include related files.

    For detail views it performs :
    - retrieve
    - update
    - partial_update
    - destro

    For list views it performs :
    - list
    - create
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    #TODO Add auth-0 authentication
    # permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # The related files are already included in the serializer
        return Response(data)



# Auth0 implementation in everything


# --------------------------- for testing only ---------------------------

def edit_project_details(request, project_id):
    project = get_object_or_404(Project, id=project_id)

    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user') # replace with actual Auth0 check
    if project.user != temp_user:
        return render(request, 'api/error.html', {'message': 'Unauthorized action'})
    files = project.files.all()
    
    if request.method == 'POST':
        if 'save_changes' in request.POST:
            form = ProjectForm(request.POST, instance=project)
            if form.is_valid():
                form.save()
                return redirect('edit_project_details', project_id=project.id)
        elif 'upload_file' in request.FILES:
            file = request.FILES['upload_file']
            path = default_storage.save('uploads/' + file.name, ContentFile(file.read()))
            file_url = default_storage.url(path)
            File.objects.create(
                project=project,
                file_name=file.name,
                file_url=file_url
            )
        elif 'delete_file' in request.POST:
            file_id = request.POST.get('delete_file')
            file_to_delete = get_object_or_404(File, id=file_id)
            file_to_delete.delete()
        elif 'delete_project' in request.POST:
            project.delete()
            return redirect('user_projects')

    form = ProjectForm(instance=project)
    return render(request, 'api/edit_project_details.html', {'project': project, 'files': files, 'form': form})
