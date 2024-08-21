from rest_framework import permissions
from .views import authenticate
import logging
logger = logging.getLogger(__name__)
class IsProjectOwner(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        user ,token = authenticate(request)
        auth0_user_id = user['sub']
        logger.info(f"Checking permission for user: {auth0_user_id}")
        if hasattr(obj, 'project'):
            return obj.project.auth0_user_id == auth0_user_id
        return obj.auth0_user_id == auth0_user_id

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        user ,token = authenticate(request)
        auth0_user_id = user['sub']
        logger.info(f"Checking permission for user: {auth0_user_id}")


        if request.method == 'POST':
            # For creating new projects, always allow (or implement your logic here)
            from .views import ProjectViewSet  # Import here to avoid circular imports
            if isinstance(view, ProjectViewSet):
                return True
            
            # For creating new files, check project ownership
            project_id = request.data.get('project')
            if project_id:
                from .models import Project  # Import here to avoid circular imports
                try:
                    project = Project.objects.get(id=project_id)
                    return project.auth0_user_id == auth0_user_id
                except Project.DoesNotExist:
                    return False
            #check if it has the object permission
        return True


class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a project to edit it or its files.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        user ,token = authenticate(request)
        auth0_user_id = user.sub

        logger.info(f"Checking permission for user: {auth0_user_id}")

        # Write permissions are only allowed to the owner of the project.
        # For File objects, check the related project's auth0_user_id
        if hasattr(obj, 'project'):
            return obj.project.auth0_user_id == auth0_user_id
        # For Project objects, check directly
        return obj.auth0_user_id == auth0_user_id

    def has_permission(self, request, view):
        # For list views or create operations
        if request.method in permissions.SAFE_METHODS:
            return True
        
        user ,token = authenticate(request)
        auth0_user_id = user.sub
        
        if request.method == 'POST':
            # For creating new projects, always allow (or implement your logic here)
            from .views import ProjectViewSet  # Import here to avoid circular imports
            if isinstance(view, ProjectViewSet):
                return True
            
            # For creating new files, check project ownership
            project_id = request.data.get('project')
            if project_id:
                from .models import Project  # Import here to avoid circular imports
                try:
                    project = Project.objects.get(id=project_id)
                    return project.auth0_user_id == auth0_user_id
                except Project.DoesNotExist:
                    return False
        
        return True  # Default to True for other cases, object-level check will handle it