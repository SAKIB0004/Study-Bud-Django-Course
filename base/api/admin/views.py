from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.filters import SearchFilter, OrderingFilter

from base.models import User, Room, Topic

from .permissions import IsRootAdmin
from .serializers import (
    AdminRoomSerializer, AdminUserSerializer,
    BulkUserUploadSerializer, BulkRoomUploadSerializer, BulkTopicUploadSerializer
)
from .bulk_user_import import import_users
from .bulk_room_import import import_rooms
from .bulk_topic_import import import_topics
from .bulk_import.exceptions import BulkImportError
from .pagination import AdminRoomCursorPagination, AdminUserCursorPagination, AdminTopicCursorPagination
from base.api.serializers import TopicSerializer
from django.db.models import Q


class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated, IsRootAdmin]

    def get(self, request):

        data = {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "inactive_users": User.objects.filter(is_active=False).count(),
            "total_rooms": Room.objects.count(),
            "total_topics": Topic.objects.count(),


            "recent_users": list(User.objects.order_by("-date_joined").values("id", "name", "email", "date_joined")[:5]),

            "recent_rooms": list(Room.objects.order_by("-created").values("id", "name", "created")[:5]),
        }

        return Response(data)

#Room
class AdminRoomListView(APIView):
    permission_classes = [IsAuthenticated, IsRootAdmin]

    def get(self, request):
        rooms = (Room.objects.select_related("host").prefetch_related(
            "topics", "participants", "message_set__user",)
        )

        # Search by room ID or room name
        room_filter = request.query_params.get("room", "").strip()

        if room_filter:
            if room_filter.isdigit():
                rooms = rooms.filter(id=room_filter)
            else:
                rooms = rooms.filter(name__icontains=room_filter)

        # Search by topic name or filter by ID
        topic_filter = request.query_params.get("topic", "").strip()

        if topic_filter:
            if topic_filter.isdigit():
                rooms = rooms.filter(topics__id=topic_filter)
            else:
                rooms = rooms.filter(topics__name__icontains=topic_filter)

        # Search by host username or filter by ID
        host_filter = request.query_params.get("host", "").strip()

        if host_filter:
            if host_filter.isdigit():
                rooms = rooms.filter(host_id=host_filter)
            else:
                rooms = rooms.filter(host__username__icontains=host_filter)

        # Remove duplicates and order results
        rooms = rooms.distinct().order_by("-created", "-pk")

        # Pagination
        paginator = AdminRoomCursorPagination()
        paginated_rooms = paginator.paginate_queryset(rooms, request, view=self)

        serializer = AdminRoomSerializer(paginated_rooms, many=True)

        return paginator.get_paginated_response(serializer.data)

class AdminRoomCreateView(APIView):

    permission_classes = [IsAuthenticated, IsRootAdmin]

    def post(self, request):

        serializer = AdminRoomSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Topic
class AdminTopicListCreateView(APIView):

    permission_classes = [IsAuthenticated, IsRootAdmin]

    # GET: Retrieve all topics
    def get(self, request):

        topics = Topic.objects.all().order_by("name")
        serializer = TopicSerializer(topics, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: Create a new topic
    def post(self, request):

        serializer = TopicSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTopicListView(APIView):
    permission_classes = [IsAuthenticated, IsRootAdmin]

    def get(self, request):
        topics = Topic.objects.prefetch_related(
            "rooms__host"
        ).all()

        # --------------------------------
        # Search by topic ID or name
        # --------------------------------

        search = request.query_params.get("search", "").strip()

        if search:
            if search.isdigit():
                topics = topics.filter(
                    Q(id=search) |
                    Q(name__icontains=search)
                )
            else:
                topics = topics.filter(
                    name__icontains=search
                )

        # --------------------------------
        # Filter by topic ID or name
        # --------------------------------

        topic_filter = request.query_params.get(
            "topic", ""
        ).strip()

        if topic_filter:
            if topic_filter.isdigit():
                topics = topics.filter(id=topic_filter)
            else:
                topics = topics.filter(
                    name__icontains=topic_filter
                )

        # --------------------------------
        # Ordering
        # --------------------------------

        topics = topics.order_by("-pk")

        # --------------------------------
        # Pagination
        # --------------------------------

        paginator = AdminTopicCursorPagination()

        paginated_topics = paginator.paginate_queryset(
            topics,
            request,
            view=self,
        )

        serializer = TopicSerializer(
            paginated_topics,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

#User

class AdminUserListCreateView(ListCreateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsRootAdmin]
    pagination_class = AdminUserCursorPagination
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["username", "email", "name",]
    ordering_fields = ["id", "username", "email", "date_joined",]
    ordering = ["-date_joined"]

    def get_queryset(self):
        users = User.objects.select_related("role").all()

        # Filter by role
        role = self.request.query_params.get("role")

        if role:
            users = users.filter(role__name=role)

        # Filter by account status
        is_active = self.request.query_params.get("is_active")

        if is_active in ["true", "false"]:
            users = users.filter(is_active=(is_active == "true"))

        # Filter by superuser status
        is_superuser = self.request.query_params.get("is_superuser")

        if is_superuser in ["true", "false"]:
            users = users.filter( is_superuser=(is_superuser == "true"))

        return users


class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.select_related("role").all()
    serializer_class = AdminUserSerializer

    permission_classes = [IsAuthenticated, IsRootAdmin]

# Bulk
class AdminBulkUserCreateView(APIView):
    permission_classes = [IsAuthenticated, IsRootAdmin]

    def post(self, request):
        serializer = BulkUserUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Invalid file upload.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_file = serializer.validated_data["file"]

        try:
            result = import_users(uploaded_file)
            return Response(result,status=status.HTTP_200_OK, )

        except BulkImportError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST,)


class AdminBulkRoomCreateView(APIView):
    permission_classes = [IsAuthenticated, IsRootAdmin]

    def post(self, request):
        serializer = BulkRoomUploadSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            result = import_rooms(
                serializer.validated_data["file"]
            )

            return Response(
                result,
                status=status.HTTP_200_OK,
            )

        except BulkImportError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminBulkTopicCreateView(APIView):
    permission_classes = [IsAuthenticated, IsRootAdmin]

    def post(self, request):
        serializer = BulkTopicUploadSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            result = import_topics(
                serializer.validated_data["file"]
            )

            return Response(
                result,
                status=status.HTTP_200_OK,
            )

        except BulkImportError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )



