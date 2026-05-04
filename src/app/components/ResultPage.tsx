import { Skull, Trophy, Medal, Award } from 'lucide-react';

interface PlayerResult {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface ResultPageProps {
  players: PlayerResult[];
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function ResultPage({ players, onPlayAgain, onBackToHome }: ResultPageProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-[#FFD700]" fill="currentColor" />;
      case 2:
        return <Medal className="w-7 h-7 text-[#39FF14]" fill="currentColor" />;
      case 3:
        return <Award className="w-7 h-7 text-[#FF007F]" fill="currentColor" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]',
          border: 'border-[#CC9A00]',
          shadow: 'shadow-[0_0_30px_rgba(255,215,0,0.6)]',
          text: 'text-black',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-[#39FF14] to-[#2ECC10]',
          border: 'border-[#1F9900]',
          shadow: 'shadow-[0_0_25px_rgba(57,255,20,0.5)]',
          text: 'text-black',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-[#FF007F] to-[#CC0066]',
          border: 'border-[#99004D]',
          shadow: 'shadow-[0_0_25px_rgba(255,0,127,0.5)]',
          text: 'text-white',
        };
      default:
        return {
          bg: 'bg-white/10',
          border: 'border-white/20',
          shadow: '',
          text: 'text-white',
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Skull Icon */}
      <div className="mb-8">
        <Skull className="w-24 h-24 text-[#FFD700]" strokeWidth={2} />
      </div>

      {/* Game Over Title */}
      <div className="text-center mb-10">
        <h1
          className="text-8xl font-bold text-white mb-3"
          style={{
            fontFamily: "'Fredoka One', sans-serif",
            textShadow: '0 6px 12px rgba(0,0,0,0.4), 0 0 2px white, 0 0 2px white',
            WebkitTextStroke: '1px rgba(255,255,255,0.3)',
          }}
        >
          GAME OVER
        </h1>
        <p className="text-[#FF007F] text-lg font-bold">Hope you live to tell... 💀</p>
      </div>

      {/* Results Card */}
      <div
        className="w-full max-w-3xl rounded-3xl p-10 mb-8"
        style={{
          background: 'rgba(10, 26, 61, 0.6)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="mb-6">
          <h2 className="text-lg text-white mb-8 font-bold">🏆 Final Standings</h2>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const style = getRankStyle(index + 1);
              return (
                <div
                  key={player.id}
                  className={`relative flex items-center gap-6 p-6 rounded-2xl border-b-4 transition-all ${style.bg} ${style.border} ${style.shadow}`}
                >
                  {/* Large Semi-Transparent Rank Number */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <span
                      className="text-9xl font-black"
                      style={{
                        fontFamily: "'Fredoka One', sans-serif",
                        WebkitTextStroke: '3px currentColor',
                        color: 'transparent',
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Medal Icon */}
                  <div className="flex items-center justify-center w-14 z-10">
                    {getMedalIcon(index + 1) || (
                      <span className={`${style.text} font-bold text-2xl`}>#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center z-10 shadow-lg"
                    style={{
                      background: index <= 2 ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <span
                      className={`${index <= 2 ? 'text-black' : 'text-white'} text-2xl font-bold`}
                      style={{ fontFamily: "'Fredoka One', sans-serif" }}
                    >
                      {player.name[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 z-10">
                    <div className={`${style.text} font-bold text-2xl`} style={{ fontFamily: "'Fredoka One', sans-serif" }}>
                      {player.name}
                    </div>
                    <div className={`text-sm ${style.text} opacity-80 font-bold`}>{player.score} points scored ⭐</div>
                  </div>

                  {/* Score */}
                  <div
                    className={`text-5xl font-bold ${style.text} z-10`}
                    style={{ fontFamily: "'Fredoka One', sans-serif" }}
                  >
                    {player.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-3xl space-y-4">
        <button
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-b from-[#39FF14] to-[#2ECC10] hover:brightness-110 text-black py-5 rounded-3xl font-bold transition-all shadow-[0_0_30px_rgba(57,255,20,0.6)] border-b-4 border-[#1F9900] text-xl"
        >
          🎮 Play Again
        </button>
        <button
          onClick={onBackToHome}
          className="w-full bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 text-white py-4 rounded-2xl font-bold transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
