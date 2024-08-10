from .views import *
from django.urls import path

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('upload/<int:project_id>/', upload_file, name='upload_file'),
    path('home/', user_projects, name='home'),
    path('edit_project_details/<int:project_id>/', edit_project_details, name='edit_project_details'),
    # path('projects/<int:project_id>/<int:file_id>/', render_html_file, name='render_html_file'),
]