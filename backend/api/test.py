from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from .models import File, Project
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from django.contrib.auth.models import User

class FileViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project_owner = {'auth0_user_id': 'auth0|123'}
        self.other_user = {'auth0_user_id': 'auth0|456'}
        
        # Create a user and log them in
        self.user = User.objects.create_user(username='project_owner', password='password')
        self.client.force_authenticate(user=self.user)
        
        self.project = Project.objects.create(
            auth0_user_id=self.project_owner['auth0_user_id'],
            name='Test Project',
            description='Test Description'
        )
        
        self.file = File.objects.create(
            project=self.project,
            file_name='test_file.txt',
            file_url='https://storage.googleapis.com/test-bucket/test_file.txt'
        )

    @patch('api.views.upload_file_to_gcs')
    @patch('api.views.get_user_id_from_request')
    def test_create_file(self, mock_get_user_id, mock_upload):
        mock_upload.return_value = 'https://storage.googleapis.com/test-bucket/new_file.txt'
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('file-list')
        data = {
            'project': self.project.id,
            'file': SimpleUploadedFile('new_file.txt', b'file_content'),
        }
        
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 2)
        self.assertEqual(File.objects.latest('id').file_name, 'new_file.txt')

    @patch('api.views.get_file_content_from_gcs')
    @patch('api.views.get_user_id_from_request')
    def test_retrieve_file(self, mock_get_user_id, mock_get_content):
        mock_get_content.return_value = b'mocked file content'
        mock_get_user_id.return_value = self.other_user['auth0_user_id']
        
        url = reverse('file-detail', kwargs={'pk': self.file.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'mocked file content')

    @patch('api.views.update_file_in_gcs')
    @patch('api.views.get_user_id_from_request')
    def test_update_file(self, mock_get_user_id, mock_update):
        mock_update.return_value = 'https://storage.googleapis.com/test-bucket/updated_file.txt'
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('file-detail', kwargs={'pk': self.file.id})
        data = {
            'file_name': 'updated_file.txt',
            'file': SimpleUploadedFile('updated_file.txt', b'updated_content'),
        }
        
        response = self.client.put(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.file.refresh_from_db()
        self.assertEqual(self.file.file_name, 'updated_file.txt')

    @patch('api.views.delete_file_from_gcs')
    @patch('api.views.get_user_id_from_request')
    def test_delete_file(self, mock_get_user_id, mock_delete):
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('file-detail', kwargs={'pk': self.file.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(File.objects.count(), 0)

    @patch('api.views.get_user_id_from_request')
    def test_list_files(self, mock_get_user_id):
        mock_get_user_id.return_value = self.other_user['auth0_user_id']
        
        url = reverse('file-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should see the one file we created

class ProjectViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project_owner = {'auth0_user_id': 'auth0|123'}
        self.other_user = {'auth0_user_id': 'auth0|456'}
        
        self.project = Project.objects.create(
            auth0_user_id=self.project_owner['auth0_user_id'],
            name='Test Project',
            description='Test Description'
        )

    @patch('api.views.get_user_id_from_request')
    def test_create_project(self, mock_get_user_id):
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('project-list')
        data = {
            'name': 'New Project',
            'description': 'New Description'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)
        self.assertEqual(Project.objects.latest('id').name, 'New Project')

    @patch('api.views.get_user_id_from_request')
    def test_retrieve_project(self, mock_get_user_id):
        mock_get_user_id.return_value = self.other_user['auth0_user_id']
        
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Project')

    @patch('api.views.get_user_id_from_request')
    def test_update_project(self, mock_get_user_id):
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        data = {
            'name': 'Updated Project',
            'description': 'Updated Description'
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.name, 'Updated Project')

    @patch('api.views.get_user_id_from_request')
    def test_delete_project(self, mock_get_user_id):
        mock_get_user_id.return_value = self.project_owner['auth0_user_id']
        
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)

    @patch('api.views.get_user_id_from_request')
    def test_list_projects(self, mock_get_user_id):
        mock_get_user_id.return_value = self.other_user['auth0_user_id']
        
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should see the one project we created