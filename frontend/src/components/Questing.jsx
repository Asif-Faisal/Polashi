import { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Questing({ socket, gameState, setError }) {
  const { proposedTeam, players, me } = gameState;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { t } = useLanguage();

  const isOnTeam = proposedTeam.includes(me?.id);
  const isGood = me?.faction === 'Good';

  const teamNames = proposedTeam.map(id => players.find(p => p.id === id)?.name);

  const handleSubmit = (card) => {
    socket.emit('submit_quest_card', { card }, (res) => {
      if (res && res.error) setError(res.error);
      else setHasSubmitted(true);
    });
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t('questBegins')}</h2>
        <p className="text-gray-400 mb-4">{t('questDesc')}</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {teamNames.map((name, i) => (
            <span key={i} className="px-3 py-1 bg-gray-700 text-white rounded-full font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        {!isOnTeam ? (
          <div className="text-center space-y-4">
            <Shield className="w-16 h-16 text-gray-500 mx-auto opacity-50" />
            <h3 className="text-xl font-semibold text-white">{t('awaitingResults')}</h3>
            <p className="text-gray-400">{t('notOnTeam')}</p>
          </div>
        ) : !hasSubmitted ? (
          <div className="w-full max-w-md space-y-6">
            <h3 className="text-lg font-medium text-center text-white mb-4">{t('selectPlay')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSubmit('Success')}
                className="btn bg-blue-600 hover:bg-blue-500 text-white py-8 flex flex-col items-center gap-3 transition-transform hover:scale-105"
              >
                <Shield className="w-10 h-10" />
                <span className="text-lg font-bold uppercase tracking-wider">{t('success')}</span>
              </button>
              
              <button
                onClick={() => handleSubmit('Betrayal')}
                disabled={isGood}
                className={`btn py-8 flex flex-col items-center gap-3 transition-transform ${
                  isGood 
                    ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105'
                }`}
              >
                <ShieldAlert className="w-10 h-10" />
                <span className="text-lg font-bold uppercase tracking-wider">{t('betrayal')}</span>
              </button>
            </div>
            {isGood && (
              <p className="text-sm text-center text-blue-400 italic">
                {t('nawabRule')}
              </p>
            )}
          </div>
        ) : (
           <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />
            <h3 className="text-xl font-semibold text-white">{t('cardSubmitted')}</h3>
            <p className="text-gray-400">{t('waitingOthersQuest')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
