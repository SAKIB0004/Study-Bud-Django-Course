
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from base.models import Room, Topic, User

from .bulk_import.exceptions import BulkImportError
from .bulk_import.file_parser import read_uploaded_file
from .bulk_import.processor import process_import_rows


REQUIRED_COLUMNS = {"name"}

ALLOWED_COLUMNS = {
    "name",
    "description",
    "host_email",
    "topics",
}

MAX_ROWS = 500


def parse_topics(value):
    """
    Convert comma-separated topic names into a list of existing Topic objects.
    """
    if value is None or str(value).strip() == "":
        return []

    topic_names = [
        name.strip()
        for name in str(value).split(",")
        if name.strip()
    ]

    if not topic_names:
        return []

    normalized_names = [name.casefold() for name in topic_names]

    if len(normalized_names) != len(set(normalized_names)):
        raise ValueError("Duplicate topic names are not allowed.")

    topics = []

    for topic_name in topic_names:
        matching_topics = Topic.objects.filter(
            name__iexact=topic_name
        )

        if not matching_topics.exists():
            raise ValueError(
                f"Topic '{topic_name}' does not exist."
            )

        if matching_topics.count() > 1:
            raise ValueError(
                f"Multiple topics found with the name '{topic_name}'. "
                "Please resolve the duplicate topic records."
            )

        topics.append(matching_topics.first())

    return topics


def validate_room_row(row):
    name = str(row.get("name") or "").strip()
    description = str(row.get("description") or "").strip()
    host_email = str(row.get("host_email") or "").strip().lower()

    if not name:
        raise ValueError("Room name is required.")

    if len(name) > 200:
        raise ValueError("Room name cannot exceed 200 characters.")

    host = None

    if host_email:
        try:
            validate_email(host_email)
        except ValidationError:
            raise ValueError("Invalid host email address.")

        try:
            host = User.objects.get(email__iexact=host_email)
        except User.DoesNotExist:
            raise ValueError(
                f"No user found with host email '{host_email}'."
            )
        except User.MultipleObjectsReturned:
            raise ValueError(
                f"Multiple users found with host email '{host_email}'."
            )

    topics = parse_topics(row.get("topics"))

    return {
        "name": name,
        "description": description or None,
        "host": host,
        "topics": topics,
    }


def import_rooms(uploaded_file):
    rows = read_uploaded_file(
        uploaded_file=uploaded_file,
        required_columns=REQUIRED_COLUMNS,
        allowed_columns=ALLOWED_COLUMNS,
        max_rows=MAX_ROWS,
    )

    def validate_row(row):
        return validate_room_row(row)

    def create_record(data):
        room = Room.objects.create(
            name=data["name"],
            description=data["description"],
            host=data["host"],
        )

        # Create the many-to-many relationships.
        room.topics.set(data["topics"])

    result = process_import_rows(
        rows=rows,
        validate_row=validate_row,
        create_record=create_record,
    )

    # Add Room-specific information to failed rows.
    for error in result["errors"]:
        row_number = error["row"]

        original_row = next(
            row for number, row in rows
            if number == row_number
        )

        error["name"] = str(
            original_row.get("name") or ""
        ).strip()

        error["host_email"] = str(
            original_row.get("host_email") or ""
        ).strip().lower()

    return {
        "message": "Bulk room import completed.",
        "summary": result["summary"],
        "errors": result["errors"],
    }
