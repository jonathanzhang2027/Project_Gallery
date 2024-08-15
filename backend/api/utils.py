from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

def get_user_id_from_request(request):
    """
    Extract and validate the JWT token from the request to get the user ID.
    """
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user_id = jwt_auth.get_user(validated_token).id
            return user_id
        except AuthenticationFailed:
            return None
    return None


from firebase_admin import storage
from django.conf import settings
from urllib.parse import urlparse, unquote
import os

# Initialize the Google Cloud Storage client
from google.cloud import exceptions

def get_blob_from_url(file_url):
    """Get a blob object from a file URL"""
    try:
        bucket = storage.bucket(settings.GS_BUCKET_NAME)
        # correct = file_url.split(bucket.name + '/')[1].split('?')[0] 
        
        parsed_url = urlparse(file_url)
        # Extract the path and remove the leading '/'
        path = unquote(parsed_url.path.lstrip('/'))
        
        # Remove the bucket name from the beginning of the path if it's there
        if path.startswith(settings.GS_BUCKET_NAME + '/'):
            path = path[len(settings.GS_BUCKET_NAME) + 1:]
        
        blob = bucket.blob(path)
        # Check if the blob exists
        if not blob.exists():
            raise exceptions.NotFound(f"File not found: {path}")
        return blob
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error accessing Google Cloud Storage: {str(e)}")

def upload_file_to_gcs(file, project_id):
    """Upload a file to Google Cloud Storage"""
    try:
        bucket = storage.bucket(settings.GS_BUCKET_NAME)
        blob = bucket.blob(f"uploads/{project_id}/{file.name}")
        blob.upload_from_file(file)
        return blob.public_url
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error uploading file to Google Cloud Storage: {str(e)}")

def delete_file_from_gcs(file_url):
    """Delete a file from Google Cloud Storage"""
    try:
        blob = get_blob_from_url(file_url)
        blob.delete()
    except exceptions.NotFound:
        # If the file doesn't exist, we consider the deletion successful
        pass
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error deleting file from Google Cloud Storage: {str(e)}")

def get_file_content_from_gcs(file_url):
    """Get file content from Google Cloud Storage"""
    try:
        blob = get_blob_from_url(file_url)
        return blob.download_as_string().decode('utf-8')
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error retrieving file content from Google Cloud Storage: {str(e)}")

def update_file_in_gcs(file, file_url):
    """Update a file in Google Cloud Storage"""
    try:
        blob = get_blob_from_url(file_url)
        blob.upload_from_file(file)
        return blob.public_url
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error updating file in Google Cloud Storage: {str(e)}")