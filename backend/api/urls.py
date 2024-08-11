from .views import *
from django.urls import path

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('upload/<int:project_id>/', upload_file, name='upload_file'),
    path('home/', fetch_user_projects, name='home'),
    path('project_details/<int:project_id>/', get_project_details, name='get_project_details'),
    path('delete_file/<int:project_id>/<int:file_id>/', delete_file, name='delete_file'),
    
    path('edit_project_details/<int:project_id>/', edit_project_details, name='edit_project_details'), # for testing purposes
]