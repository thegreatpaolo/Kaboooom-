import { useState } from 'react'
import { HomePage } from './components/HomePage'
import { LobbyPage } from './components/LobbyPage'
import { GamePage } from './components/GamePage'
import { ResultPage } from './components/ResultPage'
import { createRoom, getRoomDetail } from '../services/api'
import { useGameSocket } from '../hooks/useGameSocket'

type Screen = 'home' | 'lobby' | 'game' | 'result'

interface Player {
  id: string
  name: string
  lives: number
  isActive: boolean
  isEliminated: boolean
  score: number
  streak: number
  isHost: boolean
}

interface GameResult {
  scores: { id: string; name: string; score: number; rank: number }[]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [minPlayers, setMinPlayers] = useState(2)
  const [currentWord, setCurrentWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(20)
  const [maxTime, setMaxTime] = useState(20)
  const [isPanicMode, setIsPanicMode] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  // WebSocket — active on lobby and game screens
  const isConnected = screen === 'lobby' || screen === 'game'

  const { sendEvent } = useGameSocket(
    isConnected ? roomCode : '',
    (event) => handleServerEvent(event),
    playerName
  )

  const handleServerEvent = (event: any) => {
    switch (event.type) {

      case 'joined':
        setMyPlayerId(String(event.player_id))
        setIsHost(event.is_host)
        break

      case 'players_update':
        setPlayers(event.players.map((p: any, i: number) => ({
          id: String(p.id),
          name: p.name,
          lives: p.lives,
          score: p.score,
          isHost: p.is_host,
          isActive: i === 0,
          isEliminated: p.lives <= 0,
          streak: 0,
        })))
        break

      case 'game_started':
        setCurrentWord(event.syllable)
        setTimeLeft(event.bomb_timer)
        setMaxTime(event.bomb_timer)
        setPlayers(prev => prev.map((p, i) => ({
          ...p,
          isActive: i === event.current_player_index,
        })))
        setScreen('game')
        break

      case 'timer_tick':
        setTimeLeft(event.seconds_left)
        setIsPanicMode(event.seconds_left <= 5)
        break

      case 'word_accepted':
        setCurrentWord(event.next_syllable)
        setTimeLeft(event.bomb_timer)
        setPlayers(prev => prev.map((p, i) => ({
          ...p,
          isActive: i === event.current_player_index,
          score: String(p.id) === String(event.player_id)
            ? p.score + event.score_gained
            : p.score,
        })))
        break

      case 'bomb_exploded':
        setPlayers(prev => prev.map(p => ({
          ...p,
          lives: String(p.id) === String(event.player_id)
            ? event.lives_remaining
            : p.lives,
          isEliminated: String(p.id) === String(event.player_id)
            ? event.lives_remaining <= 0
            : p.isEliminated,
        })))
        break

      case 'next_turn':
        setCurrentWord(event.syllable)
        setTimeLeft(event.bomb_timer)
        setPlayers(prev => prev.map((p, i) => ({
          ...p,
          isActive: i === event.current_player_index,
        })))
        break

      case 'game_over':
  setGameResult({
    scores: event.scores.map((p: any, i: number) => ({
      id: String(p.id),
      name: p.name,
      score: p.score,
      rank: i + 1,
    })),
  })
  setScreen('result')
  break
    }
  }

  // ── Screen handlers ───────────────────────────────────────────

  const handleCreateRoom = async (settings: {
  name: string
  difficulty: 'easy' | 'hard'
  minPlayers: number
  maxPlayers: number
  timer: number
  code: string
}) => {
  try {
    const data = await createRoom({
      difficulty: settings.difficulty,
      min_players: settings.minPlayers,
      max_players: settings.maxPlayers,
      timer: settings.timer,        
    })
    setPlayerName(settings.name)
    setRoomCode(data.code)
    setMinPlayers(settings.minPlayers)
    setMaxTime(settings.timer)      
    setTimeLeft(settings.timer)     
    setScreen('lobby')
  } catch (err) {
    alert('Failed to create room. Is the backend running?')
  }
}

  const handleJoinRoom = async (name: string, code: string) => {
    try {
      const data = await getRoomDetail(code)
      if (!data) return alert('Room not found')
      setPlayerName(name)
      setRoomCode(code)
      setMinPlayers(data.min_players)
      setScreen('lobby')
    } catch (err) {
      alert('Room not found. Check the code and try again.')
    }
  }

  const handleStartGame = () => {
    sendEvent('start_game', {})
  }

  const handleLeaveRoom = () => {
    setRoomCode('')
    setPlayers([])
    setScreen('home')
  }

  const handleSubmitWord = async (word: string) => {
    sendEvent('submit_word', {
      word,
      player_id: myPlayerId,
      syllable: currentWord,
    })
  }

  const handlePlayAgain = () => {
    setPlayers([])
    setGameResult(null)
    setScreen('home')
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {screen === 'home' && (
        <HomePage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
      {screen === 'lobby' && (
        <LobbyPage
          roomCode={roomCode}
          players={players}
          minPlayers={minPlayers}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
      {screen === 'game' && (
        <GamePage
          players={players}
          currentWord={currentWord}
          timeLeft={timeLeft}
          maxTime={maxTime}
          isPanicMode={isPanicMode}
          onSubmitWord={handleSubmitWord}
        />
      )}
      {screen === 'result' && gameResult && (
  <ResultPage
    players={gameResult.scores}
    onPlayAgain={handlePlayAgain}
    onBackToHome={handlePlayAgain}
  />
)}
    </div>
  )
}