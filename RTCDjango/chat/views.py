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
        #target_username = request.data.get('username')
        target_usersId = request.data.get('users')
        if not target_usersId:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sprawdzanie, czy użytkownik istnieje
        try:
            target_users = User.objects.filter(id__in=target_usersId)
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        current_user = self.request.user
        # Tworzenie nowego czatu z aktualnym i wybranym użytkownikiem
        usernames = [user.username for user in target_users]
        usernames.append(current_user.username)
        sorted_usernames = sorted(usernames)
        chat_name = '-'.join(sorted_usernames)
        
        chat_room = ChatRoom.objects.create(name=chat_name)
        chat_room.members.add(current_user)
        chat_room.members.add(*target_users)
        chat_room.save()

        #Serializowanie i odesłanie odpowiedzi
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
