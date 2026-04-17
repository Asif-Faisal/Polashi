import { useState, useEffect } from 'react';
import Identity from './Identity';
import TeamSelection from './TeamSelection';
import Voting from './Voting';
import Questing from './Questing';
import Assassination from './Assassination';
import GameOver from './GameOver';
import { Shield, ShieldAlert, Users, Hash, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Game({ socket, gameState, setError }) {
  const { phase, currentChapter, questResults, failedVotes, me } = gameState;
  const { t } = useLanguage();
  const [showReveal, setShowReveal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReveal(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const renderPhase = () => {
    switch (phase) {
      case 'TEAM_SELECTION':
        return <TeamSelection socket={socket} gameState={gameState} setError={setError} />;
      case 'VOTING':
        return <Voting socket={socket} gameState={gameState} setError={setError} />;
      case 'QUESTING':
        return <Questing socket={socket} gameState={gameState} setError={setError} />;
      case 'ASSASSINATION':
        return <Assassination socket={socket} gameState={gameState} setError={setError} />;
      case 'GAME_OVER':
        return <GameOver socket={socket} gameState={gameState} />;
      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <div className="space-y-6 relative">
      {showReveal && me && me.image && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-md animate-in fade-in duration-500">
           <h2 className="text-4xl font-bold text-white mb-8 animate-pulse drop-shadow-lg">{t('yourIdentity')}</h2>
           <div className="relative group">
             <div className={`absolute -inset-1 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${me.faction === 'Good' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
             <img 
               src={`/cards/${me.image}.png`} 
               alt={me.role} 
               className="relative w-72 h-auto rounded-xl shadow-2xl border-2 border-gray-800"
             />
           </div>
           <p className="mt-8 text-2xl font-black tracking-wider text-white drop-shadow-md">
             {me.role}
           </p>
           <p className={`text-lg font-semibold mt-2 ${me.faction === 'Good' ? 'text-blue-400' : 'text-red-400'}`}>
             {me.faction === 'Good' ? t('factionGood') : t('factionEvil')}
           </p>
        </div>
      )}

      {/* Top Bar Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-700 shadow-sm">
          <span className="text-xs text-gray-400 uppercase font-semibold mb-1 tracking-wider">{t('chapter')}</span>
          <span className="text-2xl font-bold text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            {currentChapter + 1} / 5
          </span>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-700 shadow-sm">
          <span className="text-xs text-gray-400 uppercase font-semibold mb-1 tracking-wider">{t('failedVotes')}</span>
          <span className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className={`w-5 h-5 ${failedVotes > 2 ? 'text-red-500' : 'text-yellow-500'}`} />
            {failedVotes} / 5
          </span>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-700 shadow-sm col-span-2">
          <span className="text-xs text-gray-400 uppercase font-semibold mb-1 tracking-wider">{t('questHistory')}</span>
          <div className="flex gap-2 mt-1">
            {[0, 1, 2, 3, 4].map((i) => {
              const result = questResults[i];
              if (result === true) return <div key={i} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-blue-300"><Shield className="w-4 h-4 text-white" /></div>;
              if (result === false) return <div key={i} className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)] border-2 border-red-400"><ShieldAlert className="w-4 h-4 text-white" /></div>;
              return <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center text-xs text-gray-400 font-medium">{i+1}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {renderPhase()}
        </div>
        
        <div className="md:col-span-1">
          {/* Identity Sidebar */}
          {phase !== 'GAME_OVER' && <Identity gameState={gameState} />}
          
          {/* Info Panel */}
          <div className="card mt-6 bg-gray-800/50 border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('gameInfo')}
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>{t('room')}: <span className="font-mono text-white bg-gray-700 px-1 rounded">{gameState.roomCode}</span></p>
              <p>{t('phase')}: <span className="font-semibold text-primary">{phase.replace('_', ' ')}</span></p>
              <div className="pt-2 border-t border-gray-700/50 mt-2">
                <p className="text-xs text-gray-500 italic">{t('nawabWinReq')}</p>
                <p className="text-xs text-gray-500 italic">{t('eicWinReq')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
