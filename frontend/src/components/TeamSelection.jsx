import { useState } from 'react';
import { UserCheck, Crown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function TeamSelection({ socket, gameState, setError }) {
  const [selected, setSelected] = useState([]);
  const { players, me, senapatiId, requiredTeamSize } = gameState;
  const { t } = useLanguage();

  const isSenapati = me?.id === senapatiId;

  const togglePlayer = (id) => {
    if (!isSenapati) return;
    if (selected.includes(id)) {
      setSelected(selected.filter(pId => pId !== id));
    } else {
      if (selected.length < requiredTeamSize) {
        setSelected([...selected, id]);
      }
    }
  };

  const handlePropose = () => {
    if (selected.length !== requiredTeamSize) {
      setError(`Please select exactly ${requiredTeamSize} players`);
      return;
    }
    socket.emit('propose_team', { teamIds: selected }, (res) => {
      if (res && res.error) setError(res.error);
    });
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('teamSelection')}</h2>
        {isSenapati ? (
          <p className="text-primary font-medium flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />
            {t('youAreSenapati', { n: requiredTeamSize })}
          </p>
        ) : (
          <p className="text-gray-400">
            {t('waitingSenapati', { name: players.find(p => p.id === senapatiId)?.name })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 flex-grow">
        {players.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePlayer(p.id)}
              disabled={!isSenapati}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                isSelected
                  ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              } ${!isSenapati && 'cursor-default hover:border-gray-700'}`}
            >
              {p.id === senapatiId && (
                <Crown className="w-4 h-4 text-yellow-500 absolute top-2 right-2" />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                isSelected ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {p.name}
              </span>
              {isSelected && <UserCheck className="w-4 h-4 text-primary absolute bottom-2 right-2" />}
            </button>
          );
        })}
      </div>

      {isSenapati && (
        <button
          onClick={handlePropose}
          disabled={selected.length !== requiredTeamSize}
          className="btn btn-primary w-full py-3 text-lg mt-auto"
        >
          {t('proposeTeam', { selected: selected.length, req: requiredTeamSize })}
        </button>
      )}
    </div>
  );
}
