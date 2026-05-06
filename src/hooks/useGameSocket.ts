import { useEffect, useRef, useCallback } from 'react'

const WS_BASE = 'ws://127.0.0.1:8000/ws/game'

export function useGameSocket(
  roomCode: string,
  onMessage: (event: any) => void,
  playerName: string
) {
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!roomCode) return

    ws.current = new WebSocket(`${WS_BASE}/${roomCode}/`)

    ws.current.onopen = () => {
      console.log('[WS] Connected to room', roomCode)
      ws.current?.send(JSON.stringify({
        type: 'join_room',
        name: playerName,
      }))
    }

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      onMessage(data)
    }

    ws.current.onclose = () => console.log('[WS] Disconnected')
    ws.current.onerror = (e) => console.error('[WS] Error', e)

    return () => ws.current?.close()
  }, [roomCode])

  const sendEvent = useCallback((type: string, payload: object = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, ...payload }))
    }
  }, [])

  return { sendEvent }
}