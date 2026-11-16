from rest_framework.permissions import BasePermission
from base.models import Role


class IsRootAdmin(BasePermission):

    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):

        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role
            and user.role.name == Role.ROOT_ADMIN
        )