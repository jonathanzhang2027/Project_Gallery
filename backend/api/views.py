from django.shortcuts import render, redirect, get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .forms import ProjectForm, FileForm
from .models import Project, File
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import firebase_admin
from firebase_admin import storage
import requests
from django.views.decorators.csrf import csrf_exempt

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


def fetch_user_projects(request):
    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user') # replace with actual Auth0 check
    projects = Project.objects.filter(user=temp_user)
    return render(request, 'api/home.html', {'projects': projects})



def get_project_details(request, project_id): # CONNECTED TO FRONTEND CODE EDITOR
    project = get_object_or_404(Project, id=project_id)
    
    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user')  # Replace with actual Auth0 check
    if project.user != temp_user:
        return JsonResponse({'error': 'Unauthorized action'}, status=403)

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


# still need: 
# view for renaming file (connect to frontend) --> file editor
# view for changing / updating file contents --> file editor
# view for changing project title --> file editor
# view for changing project description --> file editor
# view for creating new empty file --> file editor
# view for uploading file --> file editor
# view for deleting project --> file editor

# view for creating project --> file editor
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
