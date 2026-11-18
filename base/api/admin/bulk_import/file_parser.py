
import csv
import io

from openpyxl import load_workbook

from .exceptions import BulkImportError


MAX_FILE_SIZE = 5 * 1024 * 1024
DEFAULT_MAX_ROWS = 500


def normalize_headers(raw_headers, required_columns, allowed_columns):
    headers = [
        str(header or "").strip().lower()
        for header in raw_headers
    ]

    if not headers or any(not header for header in headers):
        raise BulkImportError("Column names cannot be empty.")

    if len(headers) != len(set(headers)):
        raise BulkImportError("Duplicate column names are not allowed.")

    missing = required_columns - set(headers)

    if missing:
        raise BulkImportError(
            f"Missing required columns: {', '.join(sorted(missing))}."
        )

    unknown = set(headers) - allowed_columns

    if unknown:
        raise BulkImportError(
            f"Unsupported columns: {', '.join(sorted(unknown))}."
        )

    return headers


def is_blank_row(values):
    return not any(
        value is not None and str(value).strip()
        for value in values
    )


def find_xlsx_header(iterator, required_columns):
    """
    Find the first XLSX row containing all required column names.
    This allows styled templates to have a title row.
    """
    for row_number, values in enumerate(iterator, start=1):
        normalized = {
            str(value or "").strip().lower()
            for value in values
        }

        if required_columns.issubset(normalized):
            return row_number, values

    raise BulkImportError(
        "Could not find a header row containing the required columns."
    )


def read_uploaded_file(
    uploaded_file,
    required_columns,
    allowed_columns,
    max_rows=DEFAULT_MAX_ROWS,
):
    filename = uploaded_file.name.lower()

    if uploaded_file.size > MAX_FILE_SIZE:
        raise BulkImportError("File size cannot exceed 5 MB.")

    if not filename.endswith((".csv", ".xlsx")):
        raise BulkImportError("Only CSV and XLSX files are supported.")

    rows = []

    try:
        if filename.endswith(".csv"):
            content = uploaded_file.read().decode("utf-8-sig")
            reader = csv.reader(io.StringIO(content))

            raw_headers = next(reader, None)

            if not raw_headers:
                raise BulkImportError("CSV file is empty.")

            headers = normalize_headers(
                raw_headers,
                required_columns,
                allowed_columns,
            )

            for row_number, values in enumerate(reader, start=2):
                if is_blank_row(values):
                    continue

                if len(values) > len(headers):
                    raise BulkImportError(
                        f"Too many values in CSV row {row_number}."
                    )

                values += [""] * (len(headers) - len(values))

                rows.append((
                    row_number,
                    dict(zip(headers, values)),
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

                header_row_number, raw_headers = find_xlsx_header(
                    iterator,
                    required_columns,
                )

                headers = normalize_headers(
                    raw_headers,
                    required_columns,
                    allowed_columns,
                )

                for row_number, values in enumerate(
                    iterator,
                    start=header_row_number + 1,
                ):
                    values = list(values)

                    if is_blank_row(values):
                        continue

                    if len(values) > len(headers):
                        extra_values = values[len(headers):]

                        if any(
                            value is not None and str(value).strip()
                            for value in extra_values
                        ):
                            raise BulkImportError(
                                f"Too many values in Excel row {row_number}."
                            )

                    values = values[:len(headers)]
                    values += [None] * (len(headers) - len(values))

                    rows.append((
                        row_number,
                        dict(zip(headers, values)),
                    ))

            finally:
                workbook.close()

    except UnicodeDecodeError:
        raise BulkImportError("CSV must use UTF-8 encoding.")

    except csv.Error:
        raise BulkImportError("Invalid CSV file format.")

    except BulkImportError:
        raise

    except Exception:
        raise BulkImportError("Unable to read the uploaded file.")

    if not rows:
        raise BulkImportError("No records found in the uploaded file.")

    if len(rows) > max_rows:
        raise BulkImportError(
            f"Maximum {max_rows} records can be imported at once."
        )

    return rows
