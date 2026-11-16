
from urllib.parse import parse_qs, urlsplit

from rest_framework.pagination import CursorPagination
from rest_framework.response import Response


class AdminRoomCursorPagination(CursorPagination):
    page_size = 10
    page_size_query_param = "limit"
    max_page_size = 100

    cursor_query_param = "cursor"
    ordering = ("-created", "-pk")

    def paginate_queryset(self, queryset, request, view=None):
        # CursorPagination does not calculate the total number of records.
        self.total_count = queryset.count()

        return super().paginate_queryset(
            queryset,
            request,
            view=view,
        )

    def get_cursor_value(self, url):
        if not url:
            return None

        query_params = parse_qs(urlsplit(url).query)
        return query_params.get(self.cursor_query_param, [None])[0]

    def get_relative_url(self, url):
        if not url:
            return None

        parsed_url = urlsplit(url)
        relative_url = parsed_url.path

        if parsed_url.query:
            relative_url += f"?{parsed_url.query}"

        return relative_url

    def get_paginated_response(self, data):
        next_url = self.get_next_link()
        prev_url = self.get_previous_link()

        return Response({
            "data": data,
            "pagination": {
                "limit": self.get_page_size(self.request),
                "count": self.total_count,
                "next_cursor": self.get_cursor_value(next_url),
                "prev_cursor": self.get_cursor_value(prev_url),
                "has_more": next_url is not None,
                "has_prev": prev_url is not None,
                "next_url": self.get_relative_url(next_url),
                "prev_url": self.get_relative_url(prev_url),
            },
        })
