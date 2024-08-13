from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)

def get_user_id_from_request(request):
    auth_header = request.headers.get('Authorization')
    logger.info(f"Authorization Header: {auth_header}")  # Log the Authorization header

    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        logger.info(f"Extracted Token: {token}")  # Log the token

        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user_id = jwt_auth.get_user(validated_token).id
            logger.info(f"Extracted User ID: {user_id}")  # Log the extracted user ID
            return user_id
        except AuthenticationFailed as e:
            logger.error(f"Authentication Failed: {str(e)}")
            return None
    else:
        logger.error("Authorization header is missing or improperly formatted.")
    return None
