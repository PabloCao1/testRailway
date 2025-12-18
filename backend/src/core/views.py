from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Item
from .serializers import ItemSerializer, UserSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })