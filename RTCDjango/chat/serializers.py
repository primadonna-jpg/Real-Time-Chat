from rest_framework import serializers
from .models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = ['id', 'user', 'room', 'content', 'timestamp', 'username']

    def get_username(self, obj):
        return obj.user.username

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'members', 'messages']
