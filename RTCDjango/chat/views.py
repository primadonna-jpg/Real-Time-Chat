from rest_framework import viewsets
from rest_framework.response import Response
from .models import ChatRoom, Message
from django.contrib.auth.models import User
from .serializers import ChatRoomSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import action

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from agora_token_builder import RtcTokenBuilder
import time
from .agoraConfig import CONFIG

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
        target_usersIds = request.data.get('users')
        if not target_usersIds:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # czy użytkownik istnieje
        try:
            target_users = User.objects.filter(id__in=target_usersIds)
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

        serializer = self.get_serializer(chat_room)

        # Wysyłanie powiadomienia o nowym czacie do consumer
        channel_layer = get_channel_layer()

        for user in chat_room.members.all():
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.username}',  # Kanał WebSocket tego użytkownika
                {
                    'type': 'new_chat_notification', #nazwa metody która zostanie wywołana w consumer
                    'chat_id': chat_room.id,
                    'chat_name': chat_room.name,
                }
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    #http://127.0.0.1:8000/chat/rooms/{room.id}/add_members/
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_members(self, request, pk=None):
        chat_room = self.get_object()
        new_usersIds = request.data.get('users', [])

        if not new_usersIds:
            return Response({'detail': 'User IDs are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_users = User.objects.filter(id__in = new_usersIds)
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        
        # ignorujemy użytkowników, którzy już należą do czatu
        new_users = [user for user in new_users if not chat_room.members.filter(id=user.id).exists()]

        if not new_users:
            return Response(
                {'detail': 'All specified users are already members of this chat room.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        usernames = [user.username for user in new_users]
        usernames_string = '-'.join(sorted(usernames))
        new_chat_name= f"{chat_room.name}-{usernames_string}"
        
        chat_room.name = new_chat_name
        #users_to_add = User.objects.filter(id__in=new_usersIds)
        for user in new_users:
            chat_room.members.add(user)
        
        chat_room.save()

        # notyfikacja do dodanego uzytkownika 
        channel_layer = get_channel_layer()
        for user in chat_room.members.all():
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.username}',  # Kanał WebSocket tego użytkownika
                {
                    'type': 'new_chat_notification',
                    'chat_id': chat_room.id,
                    'chat_name': chat_room.name,
                }
            )
        return Response({'detail': 'Users added successfully.'}, status=status.HTTP_200_OK)
    



    #http://127.0.0.1:8000/chat/rooms/{room.id}/remove_members/
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_members(self, request, pk=None):
        chat_room = self.get_object()
        usersIds_to_remove = request.data.get('users', [])
            
        if not usersIds_to_remove:
            return Response({'detail': 'User IDs are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            users_to_delete = User.objects.filter(id__in = usersIds_to_remove)
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Sprawdź, czy wszyscy użytkownicy są w czacie
        users_not_in_chat = [
            user.username for user in users_to_delete
            if not chat_room.members.filter(id=user.id).exists()
        ]

        if users_not_in_chat:
            return Response(
                {'detail': 'Some users are not members of this chat room.',
                'users_not_in_chat': users_not_in_chat},
                status=status.HTTP_400_BAD_REQUEST
            )

        #usuwanie
        usernames_to_delete = [user.username for user in users_to_delete]
        current_usernames = [member.username for member in chat_room.members.all()]
        updated_usernames = [username for username in current_usernames if username not in usernames_to_delete]
        usernames_string = '-'.join(sorted(updated_usernames))
        chat_room.name = usernames_string
        
        for user in users_to_delete:
            chat_room.members.remove(user)
        
        chat_room.save()

        # notyfikacja do dodanego uzytkownika 
        channel_layer = get_channel_layer()
        for user in chat_room.members.all():
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.username}',  # Kanał WebSocket tego użytkownika
                {
                    'type': 'new_chat_notification',
                    'chat_id': chat_room.id,
                    'chat_name': chat_room.name,
                }
            )

        return Response({'detail': 'Users removed successfully.'}, status=status.HTTP_200_OK)
    





    #http://127.0.0.1:8000/chat/rooms/{room.id}/remove_current_user/
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_current_user(self, request, pk=None):
        chat_room = self.get_object()
        user_to_remove = self.request.user

        # czy użytkownik jest członkiem pokoju
        if not chat_room.members.filter(id=user_to_remove.id).exists():
            return Response({'detail': 'User is not a member of this chat room.'}, status=status.HTTP_400_BAD_REQUEST)

        chat_room.members.remove(user_to_remove)

        # update nazwy pokoju
        remaining_usernames = [member.username for member in chat_room.members.all()]
        chat_room.name = '-'.join(sorted(remaining_usernames))
        chat_room.save()

        # powiadomienia do pozostalych czlonkow
        channel_layer = get_channel_layer()
        for member in chat_room.members.all():
            async_to_sync(channel_layer.group_send)(
                f'notifications_{member.username}',  
                {
                    'type': 'new_chat_notification',
                    'chat_id': chat_room.id,
                    'chat_name': chat_room.name,
                }
            )

        return Response({'detail': 'User removed successfully.'}, status=status.HTTP_200_OK)
    
    #http://127.0.0.1:8000/chat/rooms/{room.id}/generate_agora_token/
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def generate_agora_token(self, request, pk=None):
        app_id = CONFIG['app_id']
        app_certificate = CONFIG['app_certificate']
        expiration_time_in_seconds = 3600  # Token ważny przez 1 godzinę
        current_timestamp = int(time.time())

        privilege_expired = current_timestamp + expiration_time_in_seconds

        chat_room = self.get_object()
        user_id = self.request.user.id  
        channel_name = chat_room.name  # Kanał będzie nazwą pokoju czatu
        role = 1 # 1-host 2-audiance

        token = RtcTokenBuilder.buildTokenWithUid(
        app_id,
        app_certificate,
        channel_name,
        user_id,
        role,
        privilege_expired
        )

        # powiadomienia do pozostalych czlonkow
        channel_layer = get_channel_layer()
        for member in chat_room.members.all():
            async_to_sync(channel_layer.group_send)(
                f'notifications_{member.username}',  
                {
                    'type': 'active_video_call_notification', #nazwa metody która zostanie wywołana w consumer
                    'chat_id': chat_room.id,
                    'chat_name': chat_room.name,
                    'video_call_token': token
                }
            )
        return Response({'agora_token': token}, status=status.HTTP_200_OK)





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



