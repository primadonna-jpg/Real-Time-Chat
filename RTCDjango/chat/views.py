from rest_framework import viewsets
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    queryset = ChatRoom.objects.all()
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            members = user
        )

class MessageViewSet(viewsets.ModelViewSet):
    
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    queryset = Message.objects.none()
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            room__members=user
        )
