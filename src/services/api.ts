import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

export const createRoom = async (config: {
  difficulty: 'easy' | 'hard'
  min_players: number
  max_players: number
}) => {
  const res = await api.post('/rooms/create/', config)
  return res.data as { code: string }
}

export const getRoomDetail = async (code: string) => {
  const res = await api.get(`/rooms/${code}/`)
  return res.data
}

export default api