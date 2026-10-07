import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './screens/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { GameStatus } from './types';
import { AllocationDatabase } from '../../lib/gameDatabase';

interface AppProps {
  initialTeamName?: string;
}

const App: React.FC<AppProps> = ({ initialTeamName = '' }) => {
  const [status, setStatus] = useState<GameStatus>('START');
  const [teamName, setTeamName] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const [awardNotice, setAwardNotice] = useState('');

  // Auto-start if team name is provided from context or localStorage session
  useEffect(() => {
    let name = initialTeamName;
    if (!name) {
      try {
        const raw = localStorage.getItem('nexus_player_session');
        if (raw) {
          const s = JSON.parse(raw);
          name = s.teamName || s.teamId || '';
        }
      } catch {}
    }
    if (name) {
      setTeamName(name);
    }
  }, [initialTeamName]);

  const handleStartGame = (name: string) => {
    setTeamName(name);
    setStatus('PLAYING');
  };

  const recordScore = (score: number, isWin: boolean) => {
    try {
      const sessionRaw = localStorage.getItem('nexus_player_session');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session?.teamId && (score > 100 || isWin)) {
          const res = AllocationDatabase.recordGameCompletion(
            session.teamId,
            'pacman',
            'Pacman Sector Defense',
            score
          );
          if (res.success) {
            setAwardNotice(`✅ MISSION ACCOMPLISHED! Sector cleared for Team ${session.teamName || session.teamId}. Logged to central control.`);
          }
        }
      }
    } catch (e) {
      console.warn('Pacman score recording notice:', e);
    }
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setStatus('GAME_OVER');
    recordScore(score, false);
  };
  
  const handleGameWin = (score: number) => {
    setFinalScore(score);
    setStatus('VICTORY');
    recordScore(score, true);
  };

  const handleRestart = () => {
    setStatus('START');
    setFinalScore(0);
    setAwardNotice('');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Top Navbar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-4">
        <button
          onClick={() => window.location.replace('/player')}
          className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded text-xs font-mono transition text-neutral-300"
        >
          ← Return to Player Terminal
        </button>
        {awardNotice && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 px-3 py-1 rounded text-xs font-mono font-bold animate-pulse">
            {awardNotice}
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl">
        {status === 'START' && (
          <StartScreen onStart={handleStartGame} />
        )}

        {status === 'PLAYING' && (
          <GameScreen 
            teamName={teamName} 
            onGameOver={handleGameOver} 
            onGameWin={handleGameWin}
          />
        )}

        {(status === 'GAME_OVER' || status === 'VICTORY' || status === 'LEADERBOARD') && (
          <div>
            {awardNotice && (
              <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 p-3 rounded text-center text-sm font-bold mb-4 animate-pulse">
                {awardNotice}
              </div>
            )}
            <LeaderboardScreen 
              currentScore={finalScore} 
              teamName={teamName}
              onRestart={handleRestart}
              isGameOver={status === 'GAME_OVER' || status === 'VICTORY'}
              isVictory={status === 'VICTORY'}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.replace('/player')}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-xs font-mono uppercase tracking-wider text-white"
              >
                ← Back to Gameplay Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;