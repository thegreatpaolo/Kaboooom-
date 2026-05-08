import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Player, GameSession
from .game_logic import (
    validate_word, generate_syllable,
    calculate_score, get_timer_for_difficulty
)

active_bomb_tasks: dict[str, asyncio.Task] = {}


class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'game_{self.room_code}'
        self.player_id = None
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f'[WORKER SPAWNED] Room={self.room_code} Channel={self.channel_name[:20]}')

    async def disconnect(self, close_code):
        print(f'[WORKER RELEASED] Room={self.room_code} Code={close_code}')
        if self.player_id:
            await self.remove_player(self.player_id)
            await self.broadcast_players()
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return await self.send_error('Invalid JSON')

        handlers = {
            'join_room':   self.handle_join,
            'start_game':  self.handle_start_game,
            'submit_word': self.handle_word_submission,
        }
        handler = handlers.get(data.get('type'))
        if handler:
            await handler(data)
        else:
            await self.send_error(f'Unknown event type: {data.get("type")}')

    async def handle_join(self, data):
        name = data.get('name', 'Anonymous').strip()[:50]
        room = await self.get_room(self.room_code)
        if not room:
            return await self.send_error('Room not found or closed')

        player_count = await self.get_player_count(room)
        is_host = player_count == 0

        player = await self.create_player(room, name, self.channel_name, is_host)
        self.player_id = player.id

        await self.send(text_data=json.dumps({
            'type': 'joined',
            'player_id': player.id,
            'is_host': is_host,
            'room_code': self.room_code,
        }))
        await self.broadcast_players()

    async def handle_start_game(self, data):
        room = await self.get_room(self.room_code)
        if not room:
            return

        custom_timer = await self.get_room_timer(room)
        timer = get_timer_for_difficulty(room.difficulty, custom_timer)
        session = await self.get_or_create_session(room)
        syllable = generate_syllable()

        await self.update_session(session,
            syllable=syllable,
            is_running=True,
            timer=timer,
            player_index=0
        )

        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game_event',
            'payload': {
                'type': 'game_started',
                'syllable': syllable,
                'current_player_index': 0,
                'bomb_timer': timer,
                'round': 1,
            }
        })

        self._cancel_bomb(self.room_code)
        active_bomb_tasks[self.room_code] = asyncio.create_task(
            self.run_bomb_timer(timer, session)
        )
        print(f'[BOMB STARTED] Room={self.room_code} Timer={timer}s')

    async def handle_word_submission(self, data):
        word = data.get('word', '').strip()
        room = await self.get_room(self.room_code)
        if not room:
            return

        session = await self.get_session(room)
        if not session or not session.is_running:
            return await self.send_error('Game is not running')

        result = validate_word(word, session.current_syllable, session.used_words)

        if result['valid']:
            self._cancel_bomb(self.room_code)

            score_gained = calculate_score(word)
            await self.update_player_score(self.player_id, score_gained)
            await self.add_used_word(session, word)

            next_syllable = generate_syllable()
            next_index = await self.get_next_alive_index(room, session)
            await self.update_session(session,
                syllable=next_syllable,
                player_index=next_index
            )

            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'game_event',
                'payload': {
                    'type': 'word_accepted',
                    'word': word,
                    'player_id': self.player_id,
                    'score_gained': score_gained,
                    'next_syllable': next_syllable,
                    'current_player_index': next_index,
                    'bomb_timer': session.bomb_timer,
                }
            })

            active_bomb_tasks[self.room_code] = asyncio.create_task(
                self.run_bomb_timer(session.bomb_timer, session)
            )
        else:
            await self.send(text_data=json.dumps({
                'type': 'word_rejected',
                'word': word,
                'reason': result['reason'],
            }))

    async def run_bomb_timer(self, seconds: int, session):
        try:
            for remaining in range(seconds, 0, -1):
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'game_event',
                    'payload': {
                        'type': 'timer_tick',
                        'seconds_left': remaining,
                    }
                })
                await asyncio.sleep(1)

            print(f'[BOMB EXPLODED] Room={self.room_code}')
            room = await self.get_room(self.room_code)
            if not room:
                return

            session = await self.get_session(room)
            players = await self.get_players(room)
            if not players:
                return

            idx = session.current_player_index % len(players)
            loser_id = players[idx]['id']
            new_lives = await self.deduct_life(loser_id)

            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'game_event',
                'payload': {
                    'type': 'bomb_exploded',
                    'player_id': loser_id,
                    'lives_remaining': new_lives,
                }
            })

            if new_lives <= 0:
                alive = await self.get_alive_players(room)
                if len(alive) == 1:
                    await self.channel_layer.group_send(self.room_group_name, {
                        'type': 'game_event',
                        'payload': {
                            'type': 'game_over',
                            'winner_id': alive[0]['id'],
                            'winner_name': alive[0]['name'],
                            'scores': alive,
                        }
                    })
                    await self.update_session(session, is_running=False)
                    return
                if len(alive) == 0:
                    return

            next_index = await self.get_next_alive_index(room, session)
            next_syllable = generate_syllable()
            await self.update_session(session,
                syllable=next_syllable,
                player_index=next_index
            )

            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'game_event',
                'payload': {
                    'type': 'next_turn',
                    'syllable': next_syllable,
                    'current_player_index': next_index,
                    'bomb_timer': session.bomb_timer,
                }
            })

            active_bomb_tasks[self.room_code] = asyncio.create_task(
                self.run_bomb_timer(session.bomb_timer, session)
            )

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f'[BOMB ERROR] Room={self.room_code} Error={e}')

    def _cancel_bomb(self, room_code: str):
        task = active_bomb_tasks.get(room_code)
        if task and not task.done():
            task.cancel()

    async def game_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))

    async def broadcast_players(self):
        room = await self.get_room(self.room_code)
        if not room:
            return
        players = await self.get_players(room)
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game_event',
            'payload': {'type': 'players_update', 'players': players}
        })

    async def send_error(self, message: str):
        await self.send(text_data=json.dumps({
            'type': 'error', 'message': message
        }))

    @database_sync_to_async
    def get_room(self, code):
        try:
            return Room.objects.get(code=code, is_active=True)
        except Room.DoesNotExist:
            return None

    @database_sync_to_async
    def get_player_count(self, room):
        return room.players.count()

    @database_sync_to_async
    def create_player(self, room, name, channel_name, is_host):
        return Player.objects.create(
            room=room, name=name,
            channel_name=channel_name, is_host=is_host,
        )

    @database_sync_to_async
    def remove_player(self, player_id):
        Player.objects.filter(id=player_id).delete()

    @database_sync_to_async
    def get_or_create_session(self, room):
        session, _ = GameSession.objects.get_or_create(room=room)
        return session

    @database_sync_to_async
    def get_session(self, room):
        try:
            return GameSession.objects.get(room=room)
        except GameSession.DoesNotExist:
            return None

    @database_sync_to_async
    def update_session(self, session, syllable=None, is_running=None,
                       player_index=None, timer=None):
        if syllable is not None:
            session.current_syllable = syllable
        if is_running is not None:
            session.is_running = is_running
        if player_index is not None:
            session.current_player_index = player_index
        if timer is not None:
            session.bomb_timer = timer
        session.save()

    @database_sync_to_async
    def add_used_word(self, session, word):
        session.used_words.append(word.lower())
        session.save()

    @database_sync_to_async
    def update_player_score(self, player_id, score_gained):
        player = Player.objects.get(id=player_id)
        player.score += score_gained
        player.save()

    @database_sync_to_async
    def deduct_life(self, player_id):
        player = Player.objects.get(id=player_id)
        player.lives = max(0, player.lives - 1)
        player.save()
        return player.lives

    @database_sync_to_async
    def get_players(self, room):
        return list(room.players.values(
            'id', 'name', 'score', 'lives', 'is_host'
        ))

    @database_sync_to_async
    def get_alive_players(self, room):
        return list(room.players.filter(lives__gt=0).values(
            'id', 'name', 'score'
        ))

    @database_sync_to_async
    def get_next_alive_index(self, room, session):
        alive_count = room.players.filter(lives__gt=0).count()
        if alive_count == 0:
            return 0
        return (session.current_player_index + 1) % alive_count

    @database_sync_to_async
    def get_room_timer(self, room):
        return room.custom_timer