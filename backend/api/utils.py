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