import { useState } from 'react';

interface HomePageProps {
  onCreateRoom: (settings: { 
    name: string; 
    difficulty: 'easy' | 'hard'; 
    minPlayers: number; 
    maxPlayers: number; 
    timer: number;
    code: string 
  }) => void;
  onJoinRoom: (name: string, code: string) => void;
}

export function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [timer, setTimer] = useState(30);

  const handleCreateClick = () => {
    if (!playerName.trim()) return alert("Please enter your name");
    const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    onCreateRoom({ 
      name: playerName, 
      difficulty, 
      minPlayers, 
      maxPlayers, 
      timer, 
      code: generatedCode 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-7xl font-bold text-white mb-12">KABOOOOM!</h1>

      <div className="w-full max-w-md rounded-3xl p-8 bg-black/40 backdrop-blur-xl border-2 border-white/20">
        <div className="mb-6">
          <label className="block text-sm text-white font-bold mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-white/10 border-2 border-white/30 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 rounded-2xl font-bold ${activeTab === 'create' ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white'}`}>Create Room</button>
          <button onClick={() => setActiveTab('join')} className={`flex-1 py-3 rounded-2xl font-bold ${activeTab === 'join' ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white'}`}>Join Room</button>
        </div>

        {activeTab === 'create' && (
          <>
            <div className="mb-6">
              <label className="block text-sm text-white font-bold mb-3">Difficulty</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDifficulty('easy')}
                  className={`flex-1 py-4 rounded-2xl font-bold border-b-4 transition-all ${difficulty === 'easy' ? 'bg-[#39FF14] text-black border-green-700 shadow-[0_0_20px_rgba(57,255,20,0.4)]' : 'bg-white/10 text-white border-white/20'}`}
                >
                  Easy 
                </button>
                <button 
                  onClick={() => setDifficulty('hard')}
                  className={`flex-1 py-4 rounded-2xl font-bold border-b-4 transition-all ${difficulty === 'hard' ? 'bg-[#FF007F] text-white border-pink-900 shadow-[0_0_20px_rgba(255,0,127,0.4)]' : 'bg-white/10 text-white border-white/20'}`}
                >
                  Hard 
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-white font-bold mb-3">Min-Max Players (2-8)</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-blue-200 block mb-1">Min</span>
                  <input type="number" min="2" max="8" value={minPlayers} onChange={(e) => setMinPlayers(Number(e.target.value))} className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-2 text-white text-center" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-blue-200 block mb-1">Max</span>
                  <input type="number" min="2" max="8" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-2 text-white text-center" />
                </div>
              </div>
            </div>

            <button onClick={handleCreateClick} className="w-full bg-[#FFD700] text-black py-4 rounded-3xl font-bold text-lg border-b-4 border-yellow-700">
              🎮 Create a Room
            </button>
          </>
        )}
      </div>
    </div>
  );
}