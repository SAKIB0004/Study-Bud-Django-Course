from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from base.models import Room, Topic, User, Message
from .serializers import RoomSerializer, TopicSerializer, UserSerializer, UserProfileSerializer, MessageSerializer


@api_view(['GET'])
def get_routes(request):
    routes = [
        'GET /api/',

        # Authentication
        'POST /api/token/',
        'POST /api/token/refresh/',
        'POST /api/logout/',

        # Users
        'GET /api/users/',
        'GET /api/users/:id/',
        'POST /api/users-create/',
        'PATCH /api/users/:id/update/',

        # Rooms
        'GET /api/rooms/',
        'POST /api/rooms/',
        'GET /api/rooms/:id/',
        'PATCH /api/rooms/:id/update/',
        'DELETE /api/rooms/:id/delete/',

        # Messages
        'GET /api/rooms/:id/messages/',
        'POST /api/rooms/:id/messages/create/',
        'DELETE /api/rooms/:id/messages/:message_id/delete/',

        # Participants
        'GET /api/rooms/:id/participants/',

        # Topics
        'GET /api/topics/',
        'POST /api/topics/',
        'GET /api/topics/:id/',

        # Activity
        'GET /api/activity/',

        # Home
        'GET /api/home/',
        'GET /api/home/?q=<search>',
    ]

    return Response(routes, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_user(request, pk):
    user = get_object_or_404(User, id=pk)
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"detail": "Authentication required."},
    #         status=status.HTTP_401_UNAUTHORIZED
    #     )
    if request.user.id != int(pk):
        return Response(
            {"detail": "You are not allowed to update this profile."},
            status = status.HTTP_403_FORBIDDEN
        )

    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def get_rooms(request):
    if request.method == 'GET':
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    # Require authentication T
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
    room = get_object_or_404(Room, id=pk)
    serializer = RoomSerializer(room, many=False)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_room(request, pk):
    # Require authentication
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"detail": "Authentication required."},
    #         status=status.HTTP_401_UNAUTHORIZED
    #     )

    room = get_object_or_404(Room, id=pk)

    if room.host != request.user:
        return Response(
            {"detail": "You are not the host"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = RoomSerializer(room, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, pk):
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"detail": "Authentication required."},
    #         status=status.HTTP_401_UNAUTHORIZED
    #     )
    room = get_object_or_404(Room, id=pk)

    if room.host != request.user:
        return Response(
            {"detail": "You are not the host"},
            status=status.HTTP_403_FORBIDDEN
        )

    room.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_messages(request, pk):
    room = get_object_or_404(Room, id=pk)
    messages = Message.objects.filter(room=room).select_related('user', 'room').order_by('-created')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_message(request, pk):
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"detail": "Authentication required."},
    #         status=status.HTTP_401_UNAUTHORIZED
    #     )

    room = get_object_or_404(Room, id=pk)
    serializer = MessageSerializer(data=request.data)

    if serializer.is_valid():
        message = serializer.save(user=request.user, room=room)
        room.participants.add(request.user)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, pk, message_id):
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"detail": "Authentication required."},
    #         status=status.HTTP_401_UNAUTHORIZED
    #     )
    room = get_object_or_404(Room, id=pk)
    message = get_object_or_404(Message, id=message_id,room=room)

    if message.user != request.user and room.host != request.user:
        return Response(
            {"detail": "You are not allowed to delete this message."},
            status=status.HTTP_403_FORBIDDEN
        )

    message.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_participants(request, pk):
    room = get_object_or_404(Room, id=pk)
    participants = room.participants.all()
    serializer = UserSerializer(participants, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def get_topics(request):
    if request.method == 'GET':
        topics = Topic.objects.all()
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

    # Require authentication
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
    topic = get_object_or_404(Topic, id=pk)
    serializer = TopicSerializer(topic, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def get_activity(request):
    activities = Message.objects.select_related('user', 'room').order_by('-created')[:10]
    serializer = MessageSerializer(activities, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_home(request):
    q = request.query_params.get('q', '')


    rooms = Room.objects.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(description__icontains=q)
    ).distinct()

    topics = Topic.objects.all()[:5]

    room_count = rooms.count()

    room_messages = Message.objects.filter(room__in=rooms).select_related('user', 'room').order_by('-created')[:10]

    room_serializer = RoomSerializer(rooms, many=True)
    topic_serializer = TopicSerializer(topics, many=True)
    message_serializer = MessageSerializer(room_messages, many=True)

    return Response({
        'rooms': room_serializer.data,
        'topics': topic_serializer.data,
        'room_count': room_count,
        'room_messages': message_serializer.data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):

    refresh_token = request.data.get('refresh')

    if not refresh_token:
        return Response(
            {"detail": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK
        )

    except TokenError:
        return Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_400_BAD_REQUEST
        )

