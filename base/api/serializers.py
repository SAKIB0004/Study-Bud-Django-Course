from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from base.models import Room, Topic, User, Message, Role


class RoomSerializer(ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['host', 'participants']

class TopicSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class UserSerializer(ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'name', 'bio', 'avatar']

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


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
        fields = ['id', 'username', 'email', 'name', 'bio', 'avatar', 'role']
        read_only_fields = ['id']


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['user', 'room']


class RoleSerializer(ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['id']