
from rest_framework import authentication, exceptions
from .utils import decode_jwt

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', None)
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
