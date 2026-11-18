
from django.db import IntegrityError

from base.models import Topic

from .bulk_import.exceptions import BulkImportError
from .bulk_import.file_parser import read_uploaded_file
from .bulk_import.processor import process_import_rows


REQUIRED_COLUMNS = {"name"}

ALLOWED_COLUMNS = {
    "name",
}

MAX_ROWS = 500


def validate_topic_row(row, seen_names):
    name = str(row.get("name") or "").strip()

    if not name:
        raise ValueError("Topic name is required.")

    if len(name) > 50:
        raise ValueError("Topic name cannot exceed 50 characters.")

    name_key = name.casefold()

    if name_key in seen_names:
        raise ValueError("Duplicate topic name in uploaded file.")

    if Topic.objects.filter(name__iexact=name).exists():
        raise ValueError("Topic already exists.")

    return {
        "name": name,
        "name_key": name_key,
    }


def import_topics(uploaded_file):
    rows = read_uploaded_file(
        uploaded_file=uploaded_file,
        required_columns=REQUIRED_COLUMNS,
        allowed_columns=ALLOWED_COLUMNS,
        max_rows=MAX_ROWS,
    )

    seen_names = set()

    def validate_row(row):
        return validate_topic_row(
            row=row,
            seen_names=seen_names,
        )

    def create_record(data):
        Topic.objects.create(name=data["name"])

        # Only reserve the name after successful creation.
        seen_names.add(data["name_key"])

    result = process_import_rows(
        rows=rows,
        validate_row=validate_row,
        create_record=create_record,
    )

    for error in result["errors"]:
        row_number = error["row"]

        original_row = next(
            row for number, row in rows
            if number == row_number
        )

        error["name"] = str(
            original_row.get("name") or ""
        ).strip()

    return {
        "message": "Bulk topic import completed.",
        "summary": result["summary"],
        "errors": result["errors"],
    }
