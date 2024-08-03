from django.shortcuts import render, redirect, get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .forms import ProjectForm, FileForm
from .models import Project, File
from django.contrib.auth.models import User 

def create_project(request):
    temp_user = User.objects.get(username='temp_user')  # Placeholder for Auth0 user
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.user = temp_user 
            project.save()
            return redirect('upload_file', project_id=project.id)  # Redirect to the project's detail page
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
    


'''
def upload_file(request):
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        path = default_storage.save('uploads/' + file.name, ContentFile(file.read()))
        return render(request, 'api/upload.html', {'file_url': default_storage.url(path)})
    return render(request, 'api/upload.html')
    '''