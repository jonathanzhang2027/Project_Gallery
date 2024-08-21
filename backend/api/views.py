import logging
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
from django.views.decorators.csrf import csrf_exempt

from django.http import JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from .authentication import JWTAuthentication

# Authentication abstraction to reuse
def authenticate(request):
    auth = JWTAuthentication()
    try:
        user, token = auth.authenticate(request)
    except AuthenticationFailed as e:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Authentication error'}, status=401)
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    return user, token #method returns an AUTH USER. 

'''
-----------AUTH USER FORMAT REFERENCE ------------- 
---------- note: "sub" is the auth0_user_id -------------
{
  "given_name": "First name middle name",
  "family_name": "Last name",
  "nickname": "google name",
  "name": "Full name",
  "picture": "[link to image]",
  "updated_at": "2024-08-12T13:36:31.394Z",
  "email": "[email address]",
  "email_verified": true,
  "sub": "google-oauth2|   [ example string of numbers ] "
}
'''

from rest_framework.permissions import IsAuthenticated
from .utils import upload_file_to_gcs, delete_file_from_gcs, get_file_content_from_gcs, update_file_in_gcs

@csrf_exempt
def list_user_projects(request):
    if request.method == 'GET':
        
        user, token = authenticate(request)

        if not user:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

        # Extract the Auth0 User ID from the decoded token
        auth0_user_id = user.get('sub')  # Assuming 'sub' contains the Auth0 User ID

        # Filter projects by the Auth0 User ID
        user_projects = Project.objects.filter(auth0_user_id=auth0_user_id)
        user_projects_data = list(user_projects.values('id', 'name', 'description', 'created_at', 'updated_at', 'auth0_user_id'))
     
        return JsonResponse({'projects': user_projects_data}, safe=False, status=200)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


# CONNECTED TO FRONTEND CREATE PROJECT PAGE
@csrf_exempt
def create_project(request):
    if request.method == 'POST':
        user, token = authenticate(request)
        
        data = json.loads(request.body)
        form = ProjectForm(data)

        if form.is_valid():
            project = form.save(commit=False)
            project.auth0_user_id = user.get('sub')
            project.save()
            return JsonResponse({'status': 'success', 'project_id': project.id}, status=201)

        return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# NEEDS CONNECTING TO FRONTEND CODE EDITOR
@csrf_exempt
def upload_file(request, project_id):
    project = get_object_or_404(Project, pk=project_id)

    authenticate(request)

    if request.method == 'POST' and 'file' in request.FILES:
        file = request.FILES['file']
        path = default_storage.save('uploads/' + file.name, ContentFile(file.read()))
        file_url = default_storage.url(path)
        File.objects.create(
            project=project,
            file_name=file.name,
            file_url=file_url
        )
        return JsonResponse({'status': 'success', 'file_url': file_url}, status=201)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


def get_project_details(request, project_id): # CONNECTED TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, id=project_id)

    user, token = authenticate(request)
    if user.get('sub')!= project.auth0_user_id: 
        return JsonResponse({'status': 'error', 'message': 'This isn\'t your project'}, status=405)

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
        'files': files_data,
        'auth0_user_id' : project.auth0_user_id
    }

    return JsonResponse(project_data)

@csrf_exempt
def delete_file(request, project_id, file_id): # CONNECTED TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, id=project_id)
    file = get_object_or_404(File, id=file_id, project=project)
    
    authenticate(request)
    
    # Delete the file from Google Cloud Storage
    bucket = storage.bucket()
    file_path = file.file_url.split(bucket.name + '/')[1].split('?')[0]  # Extract path
    blob = bucket.blob(file_path)
    blob.delete()  # This deletes the file from Google Cloud Storage
    
    # Delete the file record from the database
    file.delete()
    
    return JsonResponse({'success': True})

# for testing DJANGO backend view only
def display_user_projects_home(request):
    # # Placeholder for Auth0 user check
    # authenticate
    projects = Project.objects
    return render(request, 'api/home.html', {'projects': projects})


'''
#CRUD files
    - view for changing / updating file contents --> file editor
    - view for renaming file (connect to frontend) --> file editor
    - view for creating new empty file --> file editor
    - view for uploading file --> file editor
'''

from .serializers import ProjectSerializer, FileSerializer
from .permissions import IsProjectOwner
from rest_framework import viewsets, status, exceptions
from rest_framework.response import Response
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class FileViewSet(viewsets.ModelViewSet):
    """
    This ViewSet provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.
    
    Additionally, in detail views it'll retrieve the file content from Google Cloud Storage.
    """
    
    queryset = File.objects.all()
    serializer_class = FileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsProjectOwner]
    
    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        project_id = request.data.get('project')
        if not project_id:
            return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # The permission class will handle ownership check

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
            logger.info(f"File created: {serializer.data['file_name']} for project {project_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating file: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        # additionally fetch the content files in detail view
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        try:
            data['content'] = get_file_content_from_gcs(instance.file_url)
            logger.info(f"File content retrieved: {instance.file_name}")
            return Response(data)
        except exceptions.NotFound:
            logger.warning(f"File not found in storage: {instance.file_url}")
            return Response({'error': 'File not found in storage'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving file content: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """handles both partial and full update"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        file = request.FILES.get('file')

        # The permission class will handle ownership check

        try:
            # Create a mutable copy of the request data
            mutable_data = request.data.copy()

            if file:
                file_url = update_file_in_gcs(file, instance.file_url)
                mutable_data['file_url'] = file_url

                
            serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            logger.info(f"File updated: {instance.file_name}")
            return Response(serializer.data)
        except exceptions.NotFound:
            logger.warning(f"File not found in storage: {instance.file_url}")
            return Response({'error': 'File not found in storage'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating file: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # The permission class will handle ownership check
        
        try:
            delete_file_from_gcs(instance.file_url)
            self.perform_destroy(instance)
            logger.info(f"File deleted: {instance.file_name}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
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
    #T ODO Add auth-0 authentication
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsProjectOwner]
    def list(self, request, *args, **kwargs):
        logger.info("list called")
        user, token = authenticate(request)
        if not user:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
        auth0_user_id = user.get('sub')  # Assuming 'sub' contains the Auth0 User ID
        
        # Filter projects by the Auth0 User ID
        queryset = Project.objects.filter(auth0_user_id=auth0_user_id)

        # Use the serializer to convert the queryset to JSON
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
   
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # The related files are already included in the serializer
        return Response(data)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        project_id = instance.id

        # Get all related files
        related_files = File.objects.filter(project_id=project_id)

        # Delete files from Google Cloud Storage
        gcs_deletion_errors = []
        for file in related_files:
            try:
                delete_file_from_gcs(file.file_url)
            except Exception as e:
                gcs_deletion_errors.append(f"Error deleting {file.file_name} from GCS: {str(e)}")

        # Delete related files from the database
        deletion_count = related_files.delete()[0]

        # Delete the project
        self.perform_destroy(instance)

        # Prepare response message
        message = f"Project {project_id} and {deletion_count} related files have been deleted successfully."
        if gcs_deletion_errors:
            message += " However, there were issues deleting some files from Google Cloud Storage:"
            message += " ".join(gcs_deletion_errors)
        logger.info(message)
        return Response({"message": message}, status=status.HTTP_200_OK)



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
