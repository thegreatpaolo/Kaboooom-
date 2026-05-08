import { useState } from 'react';
import { kaboomLogo } from '../../assets/index'

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
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [timer, setTimer] = useState(20);

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

  const handleJoinClick = () => {
    if (!playerName.trim()) return alert("Please enter your name first");
    if (!roomCodeInput.trim()) return alert("Please enter a room code");
    onJoinRoom(playerName, roomCodeInput.toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-[-50px] z-10 transform hover:scale-105 transition-transform duration-300">
        <img 
          src={kaboomLogo} 
          alt="KABOOOOM! Logo" 
          className="w-full max-w-[700px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="relative w-full max-w-md rounded-3xl p-8 bg-black/40 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
        
        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm text-white font-bold mb-2">Your Name</label>
          <input
            type="text"
            placeholder="Enter nickname..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-white/10 border-2 border-white/30 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => setActiveTab('create')} 
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${activeTab === 'create' ? 'bg-[#FFD700] text-black scale-105' : 'bg-white/10 text-white opacity-60'}`}
          >
            Create Room
          </button>
          <button 
            onClick={() => setActiveTab('join')} 
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${activeTab === 'join' ? 'bg-[#39FF14] text-black scale-105' : 'bg-white/10 text-white opacity-60'}`}
          >
            Join Room
          </button>
        </div>

        {/* Create Room Content */}
        {activeTab === 'create' && (
          <>
            {/* Difficulty */}
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

            {/* Min-Max Players */}
            <div className="mb-6">
              <label className="block text-sm text-white font-bold mb-3">Min-Max Players</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-blue-200 block mb-1">Min</span>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(Number(e.target.value))}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-2 text-white text-center"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-blue-200 block mb-1">Max</span>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-2 text-white text-center"
                  />
                </div>
              </div>
            </div>

            {/* Bomb Timer Slider */}
            <div className="mb-6">
              <label className="block text-sm text-white font-bold mb-3">
                Bomb Timer: <span className="text-yellow-400">{timer}s</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>1s</span>
                <span>15s</span>
                <span>30s</span>
              </div>
            </div>

            {/* Create Button */}
            <button 
              onClick={handleCreateClick} 
              className="w-full bg-[#FFD700] text-black py-4 rounded-3xl font-bold text-2xl border-b-4 border-yellow-700 active:transform active:scale-95 transition-transform"
            >
              🎮 Create a Room
            </button>
          </>
        )}

        {/* Join Room Content */}
        {activeTab === 'join' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <label className="block text-sm text-[#39FF14] font-bold mb-2">Enter Room Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="EX: ABCDEF"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-white/10 border-2 border-[#39FF14]/50 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-widest text-white outline-none focus:border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              />
            </div>
            
            <button 
              onClick={handleJoinClick}
              className="w-full bg-[#39FF14] text-black py-4 rounded-3xl font-bold text-2xl border-b-4 border-green-700 active:transform active:scale-95 transition-transform"
            >
<<<<<<< HEAD
               Join Room
=======
              🚀 Join Room
>>>>>>> 0e86952
            </button>
            <p className="text-center text-xs text-white/40 mt-4 italic">
              Ask your friend for the 6-character code!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}