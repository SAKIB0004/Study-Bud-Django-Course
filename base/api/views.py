from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from base.models import Room, Topic, User
from .serializers import RoomSerializer, TopicSerializer, UserSerializer
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_routes(request):
    routes = [
        'GET /api',
        # 'POST /api/token/',
        'POST /api/token/',
        'POST  /api/token/refresh/',

        'GET /api/users/',
        'GET /api/users/:id',
        'POST /api/users-create/',

        'GET /api/rooms/',
        'GET /api/rooms/:id',
        'POST /api/rooms/',
        'PATCH /api/rooms/:id/update/',
        'DELETE /api/rooms/:id/delete/',

        'GET /api/topics/',
        'GET /api/topics/:id',
        'POST /api/topics/',

    ]
    return Response(routes)


@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_user(request, pk):
    user = User.objects.get(id=pk)
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def get_rooms(request):
    if request.method == 'GET':
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    # Require authentication for POST
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    serializer = RoomSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(host=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_room(request, pk):
    room = Room.objects.get(id=pk)
    serializer = RoomSerializer(room, many=False)
    return Response(serializer.data)

@api_view(['PATCH'])
def update_room(request, pk):
    # Require authentication for POST
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    room = get_object_or_404(Room, id=pk)

    if room.host != request.user:
        return Response(
            {"detail": "You are not the host"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = RoomSerializer(room, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'POST'])
def get_topics(request):
    if request.method == 'GET':
        topics = Topic.objects.all()
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

    # Require authentication for POST
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    serializer = TopicSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_topic(request, pk):
    topic = Topic.objects.get(id=pk)
    serializer = TopicSerializer(topic, many=False)
    return Response(serializer.data)
