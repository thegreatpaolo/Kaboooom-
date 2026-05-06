import { Crown, Copy, Users, Settings } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface LobbyPageProps {
  roomCode: string;
  players: Player[];
  minPlayers: number;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function LobbyPage({ roomCode, players, minPlayers, onStartGame, onLeaveRoom }: LobbyPageProps) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  const canStart = players.length >= minPlayers;
  const isHost = players.find(p => p.isHost); // Identify if the current user is the host

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl p-8 bg-black/40 backdrop-blur-xl border-2 border-white/20">
        
        {/* Room Code Section */}
        <div className="text-center mb-8">
          <label className="block text-sm text-[#FFD700] font-bold mb-3">🔑 Room Code</label>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold text-white tracking-widest">{roomCode}</span>
            <button 
              onClick={copyRoomCode} 
              className="p-3 bg-[#FF007F] text-white rounded-xl border-b-4 border-pink-900 hover:brightness-110 transition-all"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-blue-200 font-medium mt-2">Share this code with friends 🎯</p>
        </div>

        {/* Dynamic Player List */}
        <div className="mb-8">
          <div className="flex items-center gap-2 border-b-2 border-white/10 pb-3 mb-4">
            <span className="text-white font-bold">Players ({players.length}/{minPlayers})</span>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border-2 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF007F] flex items-center justify-center font-bold text-black">
                    {player.name[0].toUpperCase()}
                  </div>
                  <span className="text-white font-bold">{player.name}</span>
                </div>
                {player.isHost && <Crown className="w-5 h-5 text-[#FFD700]" fill="currentColor" />}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full py-4 rounded-3xl font-bold text-lg border-b-4 transition-all ${
              canStart 
                ? 'bg-[#39FF14] text-black border-green-800 hover:brightness-110 shadow-[0_0_20px_rgba(57,255,20,0.4)]' 
                : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
            }`}
          >
            {canStart ? '🎮 Start Game' : `Waiting for players...`}
          </button>

          {/* DEBUG BUTTON: Only visible to host when alone */}
          {isHost && !canStart && (
            <button
              onClick={onStartGame}
              className="w-full flex items-center justify-center gap-2 bg-orange-500/20 text-orange-400 border-2 border-orange-500/40 py-2 rounded-2xl font-bold hover:bg-orange-500/30 transition-all text-sm"
            >
              <Settings className="w-4 h-4" />
              Admin: Force Start for Testing
            </button>
          )}

          <button 
            onClick={onLeaveRoom} 
            className="w-full bg-white/10 text-white py-3 rounded-2xl font-bold hover:bg-white/15 transition-all"
          >
            ← Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}