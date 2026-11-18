from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from base.models import User, Role

from .bulk_import.exceptions import BulkImportError
from .bulk_import.file_parser import read_uploaded_file
from .bulk_import.processor import process_import_rows

REQUIRED_COLUMNS = {"username", "email"}

ALLOWED_COLUMNS = {"username", "email", "name", "is_active", "role", "is_superuser"}

MAX_ROWS = 500


def parse_boolean(value, default=False):
    if value is None or str(value).strip() == "":
        return default

    value = str(value).strip().lower()

    if value in ("true", "1", "yes", "active"):
        return True

    if value in ("false", "0", "no", "inactive"):
        return False

    raise ValueError(f"Invalid boolean value: {value}")


def validate_user_row(row, default_role, seen_usernames, seen_emails):
    username = str(row.get("username") or "").strip()
    email = str(row.get("email") or "").strip().lower()
    name = str(row.get("name") or "").strip()

    if not username:
        raise ValueError("Username is required.")

    if not email:
        raise ValueError("Email is required.")

    if len(username) > 150:
        raise ValueError("Username cannot exceed 150 characters.")

    if len(name) > 255:
        raise ValueError("Name cannot exceed 255 characters.")

    try:
        validate_email(email)
    except ValidationError:
        raise ValueError("Invalid email address.")

    username_key = username.casefold()
    email_key = email.casefold()

    if username_key in seen_usernames:
        raise ValueError("Duplicate username in uploaded file.")

    if email_key in seen_emails:
        raise ValueError("Duplicate email in uploaded file.")

    if User.objects.filter(username__iexact=username).exists():
        raise ValueError("Username already exists.")

    if User.objects.filter(email__iexact=email).exists():
        raise ValueError("Email already exists.")

    role_value = str(row.get("role") or "").strip().upper()

    if role_value and role_value != Role.USER:
        raise ValueError("Only USER role is allowed in bulk import.")

    is_active = parse_boolean(
        row.get("is_active"),
        default=False,
    )

    is_superuser = parse_boolean(
        row.get("is_superuser"),
        default=False,
    )

    if is_superuser:
        raise ValueError(
            "Superuser accounts cannot be created through bulk import."
        )

    return {
        "username": username,
        "email": email,
        "name": name,
        "role": default_role,
        "is_active": is_active,
        "username_key": username_key,
        "email_key": email_key,
    }


def import_users(uploaded_file):
    rows = read_uploaded_file(
        uploaded_file=uploaded_file,
        required_columns=REQUIRED_COLUMNS,
        allowed_columns=ALLOWED_COLUMNS,
        max_rows=MAX_ROWS,
    )

    try:
        default_role = Role.objects.get(name=Role.USER)
    except Role.DoesNotExist:
        raise BulkImportError(
            "USER role does not exist. Please create it first."
        )

    seen_usernames = set()
    seen_emails = set()

    def validate_row(row):
        return validate_user_row(
            row=row,
            default_role=default_role,
            seen_usernames=seen_usernames,
            seen_emails=seen_emails,
        )

    def create_record(data):
        user = User(
            username=data["username"],
            email=data["email"],
            name=data["name"],
            role=data["role"],
            is_active=data["is_active"],
            is_superuser=False,
            is_staff=False,
        )

        user.set_unusable_password()
        user.save()

        # Reserve identifiers only after successful creation.
        seen_usernames.add(data["username_key"])
        seen_emails.add(data["email_key"])

    result = process_import_rows(
        rows=rows,
        validate_row=validate_row,
        create_record=create_record,
    )

    # Preserve the existing User import response format.
    for error in result["errors"]:
        row_number = error["row"]
        original_row = next(
            row for number, row in rows if number == row_number
        )

        error["username"] = str(
            original_row.get("username") or ""
        ).strip()

        error["email"] = str(
            original_row.get("email") or ""
        ).strip().lower()

    return {
        "message": "Bulk user import completed.",
        "summary": result["summary"],
        "errors": result["errors"],
    }
