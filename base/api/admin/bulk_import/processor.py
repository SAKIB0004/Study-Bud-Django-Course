
from django.db import IntegrityError, transaction


def process_import_rows(rows, validate_row, create_record):
    created = 0
    failed = 0
    errors = []

    for row_number, row in rows:
        try:
            data = validate_row(row)

            with transaction.atomic():
                create_record(data)

            created += 1

        except (ValueError, IntegrityError) as exc:
            failed += 1

            errors.append({
                "row": row_number,
                "error": str(exc),
            })

    return {
        "summary": {
            "total_rows": len(rows),
            "created": created,
            "failed": failed,
        },
        "errors": errors,
    }
