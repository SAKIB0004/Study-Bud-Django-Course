from rest_framework import serializers
# from django.contrib.auth import get_user_model
from base.models import Room,Message,Topic,Role, User

from base.api.serializers import RoleSerializer
from .services import create_admin_user


class AdminMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "user",
            "user_name",
            "body",
            "created",
        ]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.name or obj.user.username
        return "Unknown User"

class AdminRoomSerializer(serializers.ModelSerializer):
    topics = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        many=True
    )

    topic_names = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    participant_details = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    messages = AdminMessageSerializer(
        source="message_set",
        many=True,
        read_only=True
    )

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
            "messages",
            "created",
            "updated",
        ]

        read_only_fields = [
            "id",
            "host_name",
            "topic_names",
            "participants",
            "participants_count",
            "participant_details",
            "messages_count",
            "messages",
            "created",
            "updated",
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
                "avatar": (
                    participant.avatar.url
                    if participant.avatar
                    else None
                ),
            }
            for participant in obj.participants.all()
        ]

    def get_messages_count(self, obj):
        return obj.message_set.count()


class AdminUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "name",
            "bio",
            "avatar",
            "role",
            "role_id",
            "is_active",
            "is_superuser",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "is_superuser",
            "date_joined",
        ]

    def create(self, validated_data):
        return create_admin_user(validated_data)
