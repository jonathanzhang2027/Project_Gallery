"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import logging
from pathlib import Path
import os
from venv import logger
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv
from jwcrypto import jwk
from datetime import timedelta

import requests

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
    'storages',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': '127.0.0.1',  
        'PORT': os.getenv('DB_PORT', '3306'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Rest framework configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}


# Auth0 configuration
AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
AUTH0_CLIENT_ID = os.getenv('AUTH0_CLIENT_ID')
AUTH0_CLIENT_SECRET = os.getenv('AUTH0_CLIENT_SECRET')

AUTH0_AUDIENCE = os.getenv('AUTH0_AUDIENCE') # my api is different so this is mine...


logger = logging.getLogger(__name__) # logging for debugging purposes! Shows up in backend terminal when running backend server
def fetch_auth0_public_key():
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json" 
    response = requests.get(jwks_url)
    response.raise_for_status()
    jwks = response.json()
    key_data = jwks['keys'][0]  # Adjust if you need to select based on 'kid'
    logger.info(f"Fetched Key Data: {key_data}")
    return key_data

# Fetch the key
key_data = fetch_auth0_public_key()
PUBLIC_KEY = key_data['x5c'][0]  # x5c contains the PEM-encoded public key

# Print the PEM key to inspect it
logger.info(f"Public Key PEM: {PUBLIC_KEY}")

# Token authorization configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'RS256',
    'SIGNING_KEY': None,
    'VERIFYING_KEY': PUBLIC_KEY,
    'AUDIENCE': AUTH0_AUDIENCE,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Adjust as needed for your frontend
]



# Google Cloud Storage configuration
GS_BUCKET_NAME = os.getenv('GS_BUCKET_NAME')
GOOGLE_APPLICATION_CREDENTIALS = os.path.join(BASE_DIR, os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))

# Firebase configuration
FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT')
FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(os.path.join(BASE_DIR, FIREBASE_CREDENTIALS_PATH))
firebase_admin.initialize_app(cred,  {
    'storageBucket': FIREBASE_STORAGE_BUCKET
})

DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'