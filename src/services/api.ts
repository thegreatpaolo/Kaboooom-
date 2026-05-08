import axios from 'axios'

const api = axios.create({
  baseURL: 'https://kaboooom.onrender.com/api'
})

export const createRoom = async (config: {
  difficulty: 'easy' | 'hard'
  min_players: number
  max_players: number
  timer: number       
}) => {
  const res = await api.post('/rooms/create/', config)
  return res.data as { code: string }
}

export const getRoomDetail = async (code: string) => {
  const res = await api.get(`/rooms/${code}/`)
  return res.data
}

export default api