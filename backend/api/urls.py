from .views import *
from django.urls import path
from django.contrib import admin

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('upload/<int:project_id>/', upload_file, name='upload_file'),
    path('home/', display_user_projects_home, name='home'),
    path('project_details/<int:project_id>/', get_project_details, name='get_project_details'),
    path('delete_file/<int:project_id>/<int:file_id>/', delete_file, name='delete_file'),
    
    # WHAT THIS IS WHAT SHOWS UP IN THE FRONTEND HOME PAGE. TEST FRONTEND HOME HERE.
    path('projects/', list_user_projects, name='list_user_projects'),
    

    # CAN DELETE. THIS IS JUST TO TEST @require_auth DECORATOR
    path('public/', public),
    path('private/', private),
    path('private-scoped/', private_scoped),


    path('edit_project_details/<int:project_id>/', edit_project_details, name='edit_project_details'), # for testing purposes

]