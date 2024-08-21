
import logging
from django.http import JsonResponse
import requests
from rest_framework import authentication, exceptions
from .utils import decode_jwt
from rest_framework.exceptions import AuthenticationFailed
logger = logging.getLogger(__name__)
class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', None)
        logger.info(f"header: {auth_header} authenticated successfully.")

        if not auth_header:
            return None

        parts = auth_header.split()

        if parts[0].lower() != 'bearer':
            raise exceptions.AuthenticationFailed('Authorization header must start with Bearer')
        elif len(parts) == 1:
            raise exceptions.AuthenticationFailed('Token not found')
        elif len(parts) > 2:
            raise exceptions.AuthenticationFailed('Authorization header must be Bearer token')

        token = parts[1]
        try:
            # Decode the JWT token
            payload = decode_jwt(token)
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid token') from e

        return (payload, token)

def get_user_id_from_request(request):
    # Authentication abstraction to reuse
    from .authentication import JWTAuthentication
    auth = JWTAuthentication()
    try:
        user, token = auth.authenticate(requests.Request(request))
    except AuthenticationFailed as e:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Authentication error'}, status=401)
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    return user.get('sub') #method returns an AUTH USER. 
