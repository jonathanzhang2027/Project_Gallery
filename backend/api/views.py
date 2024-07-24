from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def upload_file(request):
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        path = default_storage.save('uploads/' + file.name, ContentFile(file.read()))
        return render(request, 'api/upload.html', {'file_url': default_storage.url(path)})
    return render(request, 'api/upload.html')