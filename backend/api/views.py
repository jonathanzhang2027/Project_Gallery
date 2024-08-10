from django.shortcuts import render, redirect, get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .forms import ProjectForm, FileForm
from .models import Project, File
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from firebase_admin import storage
import requests


def create_project(request):
    temp_user = User.objects.get(username='temp_user')  # Placeholder for Auth0 user
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.user = temp_user 
            project.save()
            return redirect('edit_project_details', project_id=project.id)  # Redirect to the project's detail page
    else:
        form = ProjectForm()
    return render(request, 'api/create_project.html', {'form': form})


def upload_file(request, project_id):
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


def user_projects(request):
    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user') # replace with actual Auth0 check
    projects = Project.objects.filter(user=temp_user)
    return render(request, 'api/home.html', {'projects': projects})


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

'''
def render_html_file(request, project_id, file_id):
    project = get_object_or_404(Project, id=project_id)

    # Placeholder for Auth0 user check
    temp_user = User.objects.get(username='temp_user') # replace with actual Auth0 check
    if project.user != temp_user:
        return render(request, 'api/error.html', {'message': 'Unauthorized action'})
    
    file = get_object_or_404(File, id=file_id)
    if not file.file_name.endswith('.html'):
        return render(request, 'api/error.html', {'message': 'File is not an HTML file'})
    
    response = requests.get(file.file_url)
    if response.status_code == 200:
        file_content = response.text
        return HttpResponse(file_content)
    else:
        return render(request, 'api/error.html', {'message': 'Could not retrieve file content'})
'''