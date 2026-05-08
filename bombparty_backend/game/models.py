from django.db import models
import random
import string


def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase, k=6))


class Room(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('hard', 'Hard')]
    code = models.CharField(max_length=6, unique=True, default=generate_room_code)
    difficulty = models.CharField(max_length=4, choices=DIFFICULTY_CHOICES, default='easy')
    min_players = models.IntegerField(default=2)
    max_players = models.IntegerField(default=8)
    custom_timer = models.IntegerField(default=20)  
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'Room {self.code} ({self.difficulty})'


class Player(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=50)
    score = models.IntegerField(default=0)
    lives = models.IntegerField(default=3)
    is_host = models.BooleanField(default=False)
    channel_name = models.CharField(max_length=255, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} in Room {self.room.code}'


class GameSession(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='session')
    current_syllable = models.CharField(max_length=10, default='')
    current_player_index = models.IntegerField(default=0)
    bomb_timer = models.IntegerField(default=20)
    is_running = models.BooleanField(default=False)
    used_words = models.JSONField(default=list)
    round_number = models.IntegerField(default=1)

    def __str__(self):
        return f'Session for Room {self.room.code}'