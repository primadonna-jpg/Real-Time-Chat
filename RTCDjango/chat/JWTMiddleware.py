from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Pobieranie tokenu JWT z query string
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token')

        if token:
            try:
                # Weryfikacja tokenu JWT
                print(f"Received token: {token[0]}")
                decoded_data = jwt_decode(token[0], settings.SECRET_KEY, algorithms=["HS256"])
                print(f"Decoded data: {decoded_data}")
                user = await get_user(decoded_data['user_id'])
                scope['user'] = user
            
            except (InvalidToken, TokenError, KeyError) as e:
                print(f"Token verification failed: {e}")
                scope['user'] = AnonymousUser()
        else:
            print("No token found")
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

# Wrapper middleware
def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
