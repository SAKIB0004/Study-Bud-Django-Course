from rest_framework import serializers
from django.contrib.auth import get_user_model
from base.models import (
    Room,Message,Topic,Role
)
from base.api.serializers import RoleSerializer

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

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        write_only=True,
        required=False
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8
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
            "password",
        ]

        read_only_fields = [
            "id",
            "is_superuser",
        ]

    def validate_role_id(self, value):
        # Never allow ROOT_ADMIN assignment through this endpoint.
        if value.name == "ROOT_ADMIN":
            raise serializers.ValidationError(
                "You cannot assign the ROOT_ADMIN role."
            )

        return value

    def validate(self, attrs):
        instance = self.instance
        request = self.context.get("request")

        if not instance and not attrs.get("password"):
            raise serializers.ValidationError({
                "password": "Password is required."
            })

        if instance:
            # Protect existing root admin accounts.
            if (
                instance.role
                and instance.role.name == "ROOT_ADMIN"
                and "role" in attrs
                and attrs["role"] != instance.role
            ):
                raise serializers.ValidationError({
                    "role_id": "Root admin role cannot be changed."
                })

            # Prevent self-role changes.
            if (
                request
                and instance.pk == request.user.pk
                and "role" in attrs
                and attrs["role"] != instance.role
            ):
                raise serializers.ValidationError({
                    "role_id": "You cannot change your own role."
                })

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")

        # Default role is USER.
        if "role" not in validated_data:
            validated_data["role"] = Role.objects.get(name="USER")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance
