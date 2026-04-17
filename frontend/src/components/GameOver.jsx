import { Trophy, Skull } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GameOver({ socket, gameState }) {
  const { winner, players } = gameState;
  const { t } = useLanguage();
  const isNawabWin = winner === 'Nawab';
  const isHost = gameState.me?.id === gameState.hostId;

  const nawabPlayers = players.filter(p => p.faction === 'Good');
  const eicPlayers = players.filter(p => p.faction === 'Evil');

  const handlePlayAgain = () => {
    if (socket) {
      socket.emit('restart_game', (res) => {
        if (res && res.error) console.error(res.error);
      });
    }
  };

  return (
    <div className={`card text-center border-2 ${isNawabWin ? 'border-blue-500/50 bg-blue-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
      <div className="mb-8">
        {isNawabWin ? (
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
        ) : (
          <Skull className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
        )}
        <h2 className={`text-5xl font-black mb-2 tracking-tight ${isNawabWin ? 'text-blue-400' : 'text-red-500'}`}>
          {isNawabWin ? t('nawabWins') : t('eicWins')}
        </h2>
        <p className="text-gray-300 text-lg">
          {isNawabWin ? t('nawabDesc') : t('eicDesc')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-left">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-blue-400 mb-4 border-b border-gray-700 pb-2">{t('goodFactionLabel')}</h3>
          <ul className="space-y-3">
            {nawabPlayers.map(p => (
              <li key={p.id} className="flex justify-between items-center bg-gray-900 p-2 rounded">
                <span className="font-medium text-white">{p.name}</span>
                <span className={`text-sm px-2 py-1 rounded font-semibold ${
                  p.role === 'Mir Modon' ? 'bg-yellow-500/20 text-yellow-500' : 'text-gray-400'
                }`}>{p.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-red-500 mb-4 border-b border-gray-700 pb-2">{t('evilFactionLabel')}</h3>
          <ul className="space-y-3">
            {eicPlayers.map(p => (
              <li key={p.id} className="flex justify-between items-center bg-gray-900 p-2 rounded">
                <span className="font-medium text-white">{p.name}</span>
                <span className={`text-sm px-2 py-1 rounded font-semibold ${
                  p.role === 'Mir Jafar' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'
                }`}>{p.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        {isHost ? (
          <button onClick={handlePlayAgain} className="btn btn-primary px-8 py-3 text-lg font-bold">
            {t('playAgain')}
          </button>
        ) : (
          <p className="text-gray-400 text-sm italic">
            {t('waitingHostRestart')}
          </p>
        )}
      </div>
    </div>
  );
}
