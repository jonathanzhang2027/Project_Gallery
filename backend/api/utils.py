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
