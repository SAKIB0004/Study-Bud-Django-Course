from rest_framework import serializers
from rest_framework.serializers import ModelSerializer,SerializerMethodField
from base.models import Room, Topic, User, Message, Role


class RoomSerializer(ModelSerializer):
    topics = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        many=True
    )

    topic_names = serializers.SerializerMethodField()
    host_name = SerializerMethodField()
    participants_count = SerializerMethodField()
    participant_details = SerializerMethodField()
    messages_count = SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "description",
            "host",
            "host_name",
            "topics",
            "topic_names",
            "participants",
            "participants_count",
            "participant_details",
            "messages_count",
            "updated",
            "created",
        ]

        read_only_fields = [
            "host",
            "participants",
            "topic_names",
            "host_name",
            "participants_count",
            "participant_details",
            "messages_count",
        ]

    def get_host_name(self, obj):
        if obj.host:
            return obj.host.name or obj.host.username
        return None

    def get_topic_names(self, obj):
        return [topic.name for topic in obj.topics.all()]

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_participant_details(self, obj):
        return [
            {
                "id": participant.id,
                "name": participant.name or participant.username,
                "username": participant.username,
                "avatar": participant.avatar.url if participant.avatar else None,
            }
            for participant in obj.participants.all()
        ]

    def get_messages_count(self, obj):
        return obj.message_set.count()


class TopicSerializer(ModelSerializer):
    hosts = SerializerMethodField()
    room_count = SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            "id",
            "name",
            "hosts",
            "room_count",
        ]

    def get_hosts(self, obj):
        rooms = obj.rooms.select_related("host").all()

        hosts = {}

        for room in rooms:
            if room.host:
                hosts[room.host.id] = {
                    "id": room.host.id,
                    "name": room.host.name or room.host.username,
                }

        return list(hosts.values())

    def get_room_count(self, obj):
        return obj.rooms.count()


class RoleSerializer(ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['id']

class UserSerializer(ModelSerializer):
    # password = serializers.CharField(write_only=True, required=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'bio', 'avatar', 'role', 'is_superuser', 'is_active', 'is_superuser']


class UserCreateSerializer(ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'name', 'role', 'is_superuser', 'bio', 'avatar']
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop('password')

        # Use USER only when role is not provided
        if "role" not in validated_data:
            validated_data["role"] = Role.objects.get(name="USER")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'bio', 'avatar']
        read_only_fields = ['id']


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['user', 'room']

