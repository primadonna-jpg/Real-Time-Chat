import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
#from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = self.scope['user']
        
        #chat_room = ChatRoom.objects.get(name=self.room_id)
        chat_room = await database_sync_to_async(ChatRoom.objects.get)(id=self.room_id)

        new_message = Message(user=user, room=chat_room, content=message) 
        await database_sync_to_async(new_message.save)() #zapis wiadomości do bazy

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': user.username,
                'user_id': user.id,
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        user_id = event['user_id']
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'user_id': user_id,
        }))



class NotificationConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        # Kanał powiadomień dla użytkownika
        self.user = self.scope['user']
        self.room_group_name = f'notifications_{self.user.username}'

        # Dodanie do grupy WebSocket 
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Usuń z grupy po rozłączeniu
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Odbieranie wiadomości z grupy WebSocket
    async def receive(self, text_data):
        # Tu obsługa wiadomości wyłanych przez klienta
        pass

    # Funkcja do wysyłania powiadomienia o nowym czacie
    async def new_chat_notification(self, event):
        # Zdarzenie zawiera dane o nowym czacie
        chat_name = event['chat_name']
        chat_id = event['chat_id']

        # Wysyłanie do fronta
        await self.send(text_data=json.dumps({
            'notification_type': "new_chat",
            'chat':{
                'name': chat_name,
                'id': chat_id
            }
        }))

    
    async def active_video_call_notification(self, event):
        chat_name = event['chat_name']
        chat_id = event ['chat_id']
        video_call_token = event ['video_call_token']
        await self.send(text_data=json.dumps({
            'notification_type': "active_video_call", #informacja dla front 
            'chat':{
                'name':chat_name,
                'id': chat_id
            },
            'video_call_token': video_call_token,
        }))
