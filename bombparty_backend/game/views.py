from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Room, Player


@api_view(['POST'])
def create_room(request):
    difficulty = request.data.get('difficulty', 'easy')
    min_players = request.data.get('min_players', 2)
    max_players = request.data.get('max_players', 8)
    custom_timer = request.data.get('timer', 20)

    room = Room.objects.create(
        difficulty=difficulty,
        min_players=min_players,
        max_players=max_players,
        custom_timer=custom_timer,
    )
    return Response({
        'code': room.code,
        'difficulty': room.difficulty,
        'min_players': room.min_players,
        'max_players': room.max_players,
        'custom_timer': room.custom_timer,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def room_detail(request, code):
    try:
        room = Room.objects.get(code=code.upper(), is_active=True)
        players = list(room.players.values(
            'id', 'name', 'score', 'lives', 'is_host'
        ))
        return Response({
            'code': room.code,
            'difficulty': room.difficulty,
            'min_players': room.min_players,
            'max_players': room.max_players,
            'player_count': len(players),
            'players': players,
        })
    except Room.DoesNotExist:
        return Response(
            {'error': 'Room not found or no longer active'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def close_room(request, code):
    try:
        room = Room.objects.get(code=code.upper())
        room.is_active = False
        room.save()
        return Response({'message': 'Room closed'})
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)