import { useState } from 'react';
import { Heart, Skull, AlertTriangle, Zap, Flame } from 'lucide-react';

interface Player {
  id: string; name: string; lives: number; isActive: boolean; isEliminated: boolean; score: number; streak: number;
}

interface GamePageProps {
  players: Player[]; currentWord: string; timeLeft: number; maxTime: number; isPanicMode: boolean; onSubmitWord: (word: string) => Promise<void>;
}

export function GamePage({ players, currentWord, timeLeft, maxTime, isPanicMode, onSubmitWord }: GamePageProps) {
  const [inputValue, setInputValue] = useState('');
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const activePlayer = players.find(p => p.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await onSubmitWord(inputValue.trim());
      setInputValue('');
    }
  };

  if (!activePlayer && players.length > 0) return <div className="text-white text-center p-20">Switching...</div>;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${isPanicMode ? 'bg-red-900/30' : ''}`}>
      <div className="w-80 border-r-2 border-white/20 p-4 bg-black/50 backdrop-blur-3xl overflow-y-auto">
        <h2 className="text-white text-xl font-bold mb-6">LEADERBOARD</h2>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className={`p-4 rounded-xl border-2 ${player.isEliminated ? 'border-red-900 bg-red-900/20' : player.isActive ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/5 bg-white/5'}`}>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{player.isEliminated ? <Skull size={16}/> : `#${index+1}`} {player.name}</span>
                {player.streak >= 3 && <Flame size={16} className="text-orange-500 animate-pulse" />}
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-green-400 font-black">{player.score} PTS</span>
                <div className="flex gap-0.5">{[...Array(3)].map((_, i) => <Heart key={i} size={10} className={i < player.lives ? "text-pink-500 fill-pink-500" : "text-gray-800"} />)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12">
        {isPanicMode && <div className="mb-8 animate-bounce bg-red-600 text-white px-8 py-3 rounded-full font-black text-2xl shadow-lg">🔥 PANIC MODE: 2X POINTS 🔥</div>}
        
        <div className={`text-center mb-12 p-12 rounded-[40px] border-4 transition-all ${isPanicMode ? 'border-red-600 bg-red-600/10' : 'border-yellow-400 bg-white/10'}`}>
          <span className="text-[120px] font-black text-white">{currentWord}</span>
          <p className="text-pink-500 font-bold mt-4 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"><AlertTriangle size={16}/> Must be a continuous syllable</p>
        </div>

        <div className="relative mb-16">
          <div className={`w-44 h-44 rounded-full border-8 flex items-center justify-center ${isPanicMode ? 'border-red-600 animate-pulse' : 'border-yellow-400'}`}>
            <span className={`text-7xl font-black ${isPanicMode ? 'text-red-600' : 'text-white'}`}>{timeLeft}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-lg relative">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value.toUpperCase())} placeholder="TYPE WORD..." className="w-full bg-white/5 border-2 border-yellow-400 rounded-3xl p-8 text-5xl text-center text-white font-black outline-none" autoFocus />
          {activePlayer && <p className="text-yellow-400 text-center mt-6 font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-sm"><Zap size={16} fill="currentColor"/> {activePlayer.name}'s turn</p>}
        </form>
      </div>
    </div>
  );
}