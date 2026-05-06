from django.contrib import admin
from .models import Room, Player, GameSession


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['code', 'difficulty', 'is_active', 'created_at']
    list_filter = ['difficulty', 'is_active']
    search_fields = ['code']


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'room', 'score', 'lives', 'is_host']
    list_filter = ['is_host']
    search_fields = ['name']


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['room', 'current_syllable', 'is_running', 'round_number']
    list_filter = ['is_running']