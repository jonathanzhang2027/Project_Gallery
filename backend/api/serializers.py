from rest_framework import serializers
from .models import Project, File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['project', 'id', 'file_name', 'file_url', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'auth0_user_id', 'name', 'description', 'created_at', 'updated_at', 'files']