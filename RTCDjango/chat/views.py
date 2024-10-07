from rest_framework import viewsets
from rest_framework.response import Response
from .models import ChatRoom, Message
from django.contrib.auth.models import User
from .serializers import ChatRoomSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    queryset = ChatRoom.objects.all()

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(members=user)



    def create(self, request, *args, **kwargs):

        # Pobranie nazwy użytkownika z requestu
        target_username = request.data.get('username')
        if not target_username:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sprawdzanie, czy użytkownik istnieje
        try:
            target_user = User.objects.get(username=target_username)
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        current_user = self.request.user
        # Tworzenie nowego czatu z aktualnym i wybranym użytkownikiem
        chat_name = f'{min(current_user.username, target_user.username)}-{max(current_user.username, target_user.username)}'
        #chat_name = "chat1"
        chat_room = ChatRoom.objects.create(name=chat_name)
        chat_room.members.add(self.request.user, target_user)
        chat_room.save()

        # Serializowanie i odesłanie odpowiedzi
        serializer = self.get_serializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)







class MessageViewSet(viewsets.ModelViewSet):
    
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    queryset = Message.objects.none()
    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get('room_id')

        if not room_id:
            return Message.objects.none()
        
        return Message.objects.filter(
            room__members=user,
            room__id = room_id
        )
