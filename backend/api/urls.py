from .views import upload_file, create_project
from django.urls import path

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('upload/<int:project_id>/', upload_file, name='upload_file'),
]