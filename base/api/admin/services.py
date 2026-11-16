
from django.conf import settings
from rest_framework.exceptions import ValidationError
from base.models import User, Role


def create_admin_user(validated_data):
    default_password = getattr(
        settings,
        "ADMIN_DEFAULT_USER_PASSWORD",
        None
    )

    if not default_password:
        raise ValidationError({
            "password": "The admin default password is not configured."
        })

    if "role" not in validated_data:
        try:
            validated_data["role"] = Role.objects.get(
                name=Role.USER
            )
        except Role.DoesNotExist:
            raise ValidationError({
                "role": "The default USER role does not exist."
            })

    user = User(**validated_data)
    user.set_password(default_password)
    user.save()

    return user
