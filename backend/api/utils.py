import requests
import jwt
from jwt import InvalidTokenError
from jwcrypto import jwk
import os

# Load environment variables
AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
API_IDENTIFIER = os.getenv('AUTH0_AUDIENCE')
ALGORITHMS = ['RS256']

def get_jwks():
    """Fetch the JSON Web Key Set (JWKS) from Auth0."""
    response = requests.get(f'https://{AUTH0_DOMAIN}/.well-known/jwks.json')
    response.raise_for_status()
    return response.json()

def get_public_key(jwk_set, kid):
    """Extract the public key from the JWKS using the key ID (kid)."""
    for key in jwk_set['keys']:
        if key['kid'] == kid:
            # Use PyJWT to convert JWK to PEM format
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)
    raise Exception('Public key not found.')

def decode_jwt(token):
    """Decode the JWT using the public key from Auth0."""
    jwks = get_jwks()
    headers = jwt.get_unverified_header(token)
    kid = headers['kid']
    public_key = get_public_key(jwks, kid)
    
    try:
        payload = jwt.decode(token, public_key, algorithms=ALGORITHMS, audience=API_IDENTIFIER)
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        raise
    except jwt.InvalidTokenError:
        print("Invalid token")
        raise
    except Exception as e:
        print(f"Error decoding token: {e}")
        raise


from firebase_admin import storage
from django.conf import settings
from urllib.parse import urlparse, unquote
import os
import uuid
# Initialize the Google Cloud Storage client
from google.cloud import exceptions

def generate_unique_filename(original_filename):
    """Generate a unique filename by prepending a UUID."""
    unique_id = str(uuid.uuid4())
    _, file_extension = os.path.splitext(original_filename)
    return f"{unique_id}{file_extension}"

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
    """Upload a file to Google Cloud Storage with a unique filename"""
    try:
        bucket = storage.bucket(settings.GS_BUCKET_NAME)
        unique_filename = generate_unique_filename(file.name)
        blob = bucket.blob(f"uploads/{project_id}/{unique_filename}")
        blob.upload_from_file(file)
        return blob.public_url #return only the public url
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error uploading file to Google Cloud Storage: {str(e)}")
import base64

def get_file_content_from_gcs(file_url):
    """Get file content from Google Cloud Storage"""
    try:
        blob = get_blob_from_url(file_url)
        if not blob.exists():
            raise FileNotFoundError(f"File not found: {file_url}")
        
        # Download as bytes for all file types
        content = blob.download_as_bytes()
        
        # Check if the content is text-based
        content_type = blob.content_type
        if content_type and content_type.startswith('text/'):
            # Try to decode text files with UTF-8
            try:
                return {
                    'content': content.decode('utf-8'),
                    'encoding': 'utf-8',
                    'is_base64': False
                }
            except UnicodeDecodeError:
                # If decoding fails, encode as base64
                return {
                    'content': base64.b64encode(content).decode('ascii'),
                    'encoding': 'base64',
                    'is_base64': True
                }
        
        # For binary files, always encode as base64
        return {
            'content': base64.b64encode(content).decode('ascii'),
            'encoding': 'base64',
            'is_base64': True
        }
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error retrieving file content from Google Cloud Storage: {str(e)}")

def update_file_in_gcs(file, old_file_url):
    """Update a file in Google Cloud Storage with a unique filename"""
    try:
        old_blob = get_blob_from_url(old_file_url)
        bucket = storage.bucket(settings.GS_BUCKET_NAME)
        
        unique_filename = generate_unique_filename(file.name)
        new_blob_path = os.path.join(os.path.dirname(old_blob.name), unique_filename)
        new_blob = bucket.blob(new_blob_path)
        
        new_blob.upload_from_file(file)
        
        old_blob.delete()
        
        return new_blob.public_url # return only the public url
    except exceptions.GoogleCloudError as e:
        raise Exception(f"Error updating file in Google Cloud Storage: {str(e)}")


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
