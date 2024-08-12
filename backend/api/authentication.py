import requests
from jose import jwt, JWTError
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

class Auth0JSONWebTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            # Split "Bearer <Token>"
            token = auth_header.split()[1]

            # Fetch the Auth0 public keys
            jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
            jwks = requests.get(jwks_url).json()

            # Decode the token using Auth0's public keys
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e']
                    }
            
            if rsa_key:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=['RS256'],
                    audience=settings.AUTH0_CLIENT_ID,
                    issuer=f'https://{settings.AUTH0_DOMAIN}/'
                )
                return (payload, token)
        except JWTError as e:
            raise exceptions.AuthenticationFailed('Invalid token')

        return None
