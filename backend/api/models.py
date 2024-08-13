from django.db import models
from django.contrib.auth.models import User  # assuming you will later switch to Auth0 users

class Project(models.Model):
    auth0_user_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class File(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file_name = models.CharField(max_length=255)
    file_url = models.URLField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.file_name
