import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LobbyPage } from './components/LobbyPage';
import { GamePage } from './components/GamePage';
import { ResultPage } from './components/ResultPage';

type GameScreen = 'home' | 'lobby' | 'game' | 'results';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  lives: number;
  isActive: boolean;
  isEliminated: boolean;
  score: number;
  streak: number;
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [maxTime, setMaxTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [isPanicMode, setIsPanicMode] = useState(false);

  const easyBank = ['BA', 'BE', 'BI', 'BO', 'BU', 'CA', 'CE', 'CI', 'CO', 'CU', 'DA', 'DE', 'DI', 'DO', 'DU', 'FA', 'FE', 'FI', 'FO', 'FU', 'GA', 'GE', 'GI', 'GO', 'GU', 'HA', 'HE', 'HI', 'HO', 'HU', 'LA', 'LE', 'LI', 'LO', 'LU', 'MA', 'ME', 'MI', 'MO', 'MU', 'NA', 'NE', 'NI', 'NO', 'NU', 'PA', 'PE', 'PI', 'PO', 'PU', 'RA', 'RE', 'RI', 'RO', 'RU', 'SA', 'SE', 'SI', 'SO', 'SU', 'TA', 'TE', 'TI', 'TO', 'TU', 'VA', 'VE', 'VI', 'VO', 'WA', 'WE', 'WI', 'WO', 'AM', 'AN', 'AR', 'AS', 'AT', 'EN', 'ER', 'ES', 'ET', 'IN', 'IS', 'IT', 'ON', 'OR', 'OT', 'UN', 'UP', 'AL', 'EL', 'IL', 'OL', 'AD', 'ED', 'ID', 'OD', 'AG', 'OG'];
  const hardBank = ['ING', 'ION', 'TER', 'ENT', 'EST', 'ERS', 'ATI', 'PRO', 'CON', 'PRE', 'VER', 'COM', 'FOR', 'RES', 'STA', 'TRA', 'STR', 'BLE', 'PLE', 'TIC', 'LIN', 'TED', 'ATE', 'GRA', 'PER', 'MIN', 'TIO', 'CAL', 'MAN', 'CHA', 'TEN', 'GEN', 'OVE', 'DER', 'AND', 'ISH', 'ECK', 'ALL', 'ACK', 'IGHT', 'END', 'AVE', 'OUT', 'EAR', 'ONE', 'ART', 'AIR', 'ILL', 'OON', 'ORE', 'INE', 'ITE', 'ICE', 'AGE', 'URE', 'ASE', 'ANT', 'ARY', 'ORY', 'MENT', 'ABLE', 'ENCE', 'ANCE', 'SHIP', 'NESS', 'LESS', 'FULL', 'SIDE', 'WARD', 'BACK', 'SELF', 'SOME', 'TIME', 'OVER', 'UNDE', 'INTE', 'EXTR', 'ABLY', 'ICAL', 'ALLY', 'TION', 'SION', 'MENT', 'ABLE', 'IBLE', 'FULY', 'LESS', 'SHIP', 'LIKE', 'WISE', 'CENT', 'CIRC', 'DEMI', 'FORE', 'HYPO', 'MONO', 'MULTI', 'PARA', 'POLY', 'SEMI'];

  const generateSyllable = (diff: 'easy' | 'hard') => {
    const bank = diff === 'hard' ? hardBank : easyBank;
    setCurrentSyllable(bank[Math.floor(Math.random() * bank.length)]);
  };

  useEffect(() => {
    if (screen === 'game' && timeLeft > 0) {
      const speed = isPanicMode ? 500 : 1000;
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), speed);
      return () => clearTimeout(timer);
    } else if (screen === 'game' && timeLeft === 0) {
      handleTimeOut();
    }
  }, [screen, timeLeft, isPanicMode]);

  const handleTimeOut = () => {
    setIsPanicMode(false);
    const updatedPlayers = players.map(p => {
      if (p.isActive) {
        const newLives = Math.max(0, p.lives - 1);
        return { ...p, lives: newLives, isEliminated: newLives === 0, streak: 0 };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    checkGameStatus(updatedPlayers);
  };

  const checkGameStatus = (currentPlayers: Player[]) => {
    const alivePlayers = currentPlayers.filter(p => !p.isEliminated);
    if (alivePlayers.length === 0 || (alivePlayers.length <= 1 && currentPlayers.length > 1)) {
      setScreen('results');
    } else {
      moveToNextPlayer(currentPlayers);
    }
  };

  const moveToNextPlayer = (currentPlayers: Player[]) => {
    const currentIndex = currentPlayers.findIndex(p => p.isActive);
    let nextIndex = (currentIndex + 1) % currentPlayers.length;
    while (currentPlayers[nextIndex].isEliminated) {
      nextIndex = (nextIndex + 1) % currentPlayers.length;
    }
    setPlayers(currentPlayers.map((p, i) => ({ ...p, isActive: i === nextIndex })));
    generateSyllable(difficulty);
    setTimeLeft(maxTime);
  };

  const checkRealWord = async (word: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return response.ok;
    } catch { return true; }
  };

  const handleSubmitWord = async (word: string) => {
    const upperWord = word.toUpperCase();
    const hasSyllable = upperWord.includes(currentSyllable);
    const isNotJustSyllable = upperWord !== currentSyllable;
    const isRealWord = await checkRealWord(word.toLowerCase());

    const updatedPlayers = players.map(p => {
      if (p.isActive) {
        if (hasSyllable && isNotJustSyllable && isRealWord) {
          const newStreak = p.streak + 1;
          if (newStreak >= 5) setIsPanicMode(true);
          const points = (timeLeft * 10) * (isPanicMode ? 2 : 1);
          return { ...p, score: p.score + points, streak: newStreak };
        } else {
          setIsPanicMode(false);
          const newLives = Math.max(0, p.lives - 1);
          return { ...p, lives: newLives, isEliminated: newLives === 0, streak: 0 };
        }
      }
      return p;
    });

    setPlayers(updatedPlayers);
    if (hasSyllable && isNotJustSyllable && isRealWord) {
      moveToNextPlayer(updatedPlayers);
    } else {
      checkGameStatus(updatedPlayers);
    }
  };

  const handleCreateRoom = (settings: any) => {
    const host: Player = { id: Math.random().toString(36).substr(2, 9), name: settings.name, isHost: true, lives: 3, isActive: true, isEliminated: false, score: 0, streak: 0 };
    setRoomCode(settings.code);
    setMaxTime(settings.timer);
    setTimeLeft(settings.timer);
    setDifficulty(settings.difficulty);
    setPlayers([host]);
    setScreen('lobby');
  };

  return (
    <div className="size-full" style={{ fontFamily: "'Fredoka One', sans-serif", background: 'linear-gradient(180deg, #0A1A3D 0%, #1A3A7D 100%)' }}>
      {screen === 'home' && <HomePage onCreateRoom={handleCreateRoom} onJoinRoom={() => {}} />}
      {screen === 'lobby' && <LobbyPage roomCode={roomCode} players={players} minPlayers={2} onStartGame={() => { generateSyllable(difficulty); setScreen('game'); }} onLeaveRoom={() => setScreen('home')} />}
      {screen === 'game' && <GamePage players={players} currentWord={currentSyllable} timeLeft={timeLeft} maxTime={maxTime} isPanicMode={isPanicMode} onSubmitWord={handleSubmitWord} />}
      {screen === 'results' && <ResultPage players={players.map(p => ({ ...p, rank: 0 }))} onPlayAgain={() => setScreen('lobby')} onBackToHome={() => setScreen('home')} />}
    </div>
  );
}