
import csv
import io

from openpyxl import load_workbook

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction

from base.models import User, Role


MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_ROWS = 500

REQUIRED_COLUMNS = {"username", "email"}

ALLOWED_COLUMNS = {
    "username",
    "email",
    "name",
    "is_active",
    "role",
    "is_superuser",
}


class BulkUserImportError(Exception):
    pass


def parse_boolean(value, default=False):
    if value is None or str(value).strip() == "":
        return default

    value = str(value).strip().lower()

    if value in ("true", "1", "yes", "active"):
        return True

    if value in ("false", "0", "no", "inactive"):
        return False

    raise ValueError(f"Invalid boolean value: {value}")


def normalize_headers(raw_headers):
    headers = [
        str(header or "").strip().lower()
        for header in raw_headers
    ]

    if not headers or any(not header for header in headers):
        raise BulkUserImportError(
            "Column names cannot be empty."
        )

    if len(headers) != len(set(headers)):
        raise BulkUserImportError(
            "Duplicate column names are not allowed."
        )

    if not REQUIRED_COLUMNS.issubset(set(headers)):
        raise BulkUserImportError(
            "Username and email columns are required."
        )

    unknown = set(headers) - ALLOWED_COLUMNS

    if unknown:
        raise BulkUserImportError(
            f"Unsupported columns: {', '.join(sorted(unknown))}"
        )

    return headers


def read_uploaded_file(uploaded_file):
    filename = uploaded_file.name.lower()

    if uploaded_file.size > MAX_FILE_SIZE:
        raise BulkUserImportError(
            "File size cannot exceed 5 MB."
        )

    if not filename.endswith((".csv", ".xlsx")):
        raise BulkUserImportError(
            "Only CSV and XLSX files are supported."
        )

    try:
        if filename.endswith(".csv"):
            content = uploaded_file.read().decode("utf-8-sig")
            reader = csv.reader(io.StringIO(content))

            raw_headers = next(reader, None)

            if not raw_headers:
                raise BulkUserImportError("CSV file is empty.")

            headers = normalize_headers(raw_headers)
            rows = []

            for row_number, values in enumerate(reader, start=2):
                if not any(
                    value is not None and str(value).strip()
                    for value in values
                ):
                    continue

                if len(values) > len(headers):
                    raise BulkUserImportError(
                        f"Too many values in CSV row {row_number}."
                    )

                values += [""] * (len(headers) - len(values))

                rows.append((
                    row_number,
                    dict(zip(headers, values))
                ))

        else:
            workbook = load_workbook(
                uploaded_file,
                read_only=True,
                data_only=True,
            )

            try:
                sheet = workbook.active
                iterator = sheet.iter_rows(values_only=True)
                raw_headers = next(iterator, None)

                if not raw_headers:
                    raise BulkUserImportError(
                        "Excel file is empty."
                    )

                headers = normalize_headers(raw_headers)
                rows = []

                for row_number, values in enumerate(iterator, start=2):
                    values = list(values)

                    if not any(
                        value is not None and str(value).strip()
                        for value in values
                    ):
                        continue

                    if len(values) > len(headers):
                        extra_values = values[len(headers):]

                        if any(
                            value is not None and str(value).strip()
                            for value in extra_values
                        ):
                            raise BulkUserImportError(
                                f"Too many values in Excel row {row_number}."
                            )

                    values = values[:len(headers)]
                    values += [None] * (len(headers) - len(values))

                    rows.append((
                        row_number,
                        dict(zip(headers, values))
                    ))

            finally:
                workbook.close()

    except UnicodeDecodeError:
        raise BulkUserImportError(
            "CSV must use UTF-8 encoding."
        )
    except csv.Error:
        raise BulkUserImportError(
            "Invalid CSV file format."
        )
    except BulkUserImportError:
        raise
    except Exception:
        raise BulkUserImportError(
            "Unable to read the uploaded file."
        )

    if not rows:
        raise BulkUserImportError(
            "No user records found."
        )

    if len(rows) > MAX_ROWS:
        raise BulkUserImportError(
            f"Maximum {MAX_ROWS} users can be imported at once."
        )

    return rows


def validate_user_row(row, default_role):
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
    }


def import_users(uploaded_file):
    rows = read_uploaded_file(uploaded_file)

    try:
        default_role = Role.objects.get(name=Role.USER)
    except Role.DoesNotExist:
        raise BulkUserImportError(
            "USER role does not exist. Please create it first."
        )

    created = 0
    failed = 0
    errors = []

    seen_usernames = set()
    seen_emails = set()

    for row_number, row in rows:
        username = str(row.get("username") or "").strip()
        email = str(row.get("email") or "").strip().lower()

        try:
            username_key = username.casefold()
            email_key = email.casefold()

            if username_key and username_key in seen_usernames:
                raise ValueError(
                    "Duplicate username in uploaded file."
                )

            if email_key and email_key in seen_emails:
                raise ValueError(
                    "Duplicate email in uploaded file."
                )

            if username_key:
                seen_usernames.add(username_key)

            if email_key:
                seen_emails.add(email_key)

            data = validate_user_row(row, default_role)

            with transaction.atomic():
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

            created += 1

        except (ValueError, IntegrityError) as exc:
            failed += 1

            errors.append({
                "row": row_number,
                "username": username,
                "email": email,
                "error": str(exc),
            })

    return {
        "message": "Bulk user import completed.",
        "summary": {
            "total_rows": len(rows),
            "created": created,
            "failed": failed,
        },
        "errors": errors,
    }
