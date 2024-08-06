from .views import *
from django.urls import path

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('upload/<int:project_id>/', upload_file, name='upload_file'),
    path('home/', user_projects, name='home'),
    path('project_details/<int:project_id>/', project_details, name='project_details'),
]