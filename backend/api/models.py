from django.db import models
from django.contrib.auth.models import User  # assuming you will later switch to Auth0 users

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Placeholder for Auth0 user
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class File(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file_name = models.CharField(max_length=255)
    file_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.file_name
