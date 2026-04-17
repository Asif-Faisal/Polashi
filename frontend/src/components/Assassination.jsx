import { useState } from 'react';
import { Target, Skull } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Assassination({ socket, gameState, setError }) {
  const { players, me } = gameState;
  const [selected, setSelected] = useState(null);
  const { t } = useLanguage();

  const isMirJafar = me?.role === 'Mir Jafar';
  // Exclude known evil players from target list
  const validTargets = players.filter(p => p.id !== me?.id);

  const handleAssassinate = () => {
    if (!selected) {
      setError('Please select a target');
      return;
    }
    socket.emit('assassinate_merlin', { targetId: selected }, (res) => {
      if (res && res.error) setError(res.error);
    });
  };

  return (
    <div className="card h-full flex flex-col border-red-500/30">
      <div className="text-center mb-6">
        <Skull className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-red-500 mb-2">{t('assassinationPhase')}</h2>
        {isMirJafar ? (
          <p className="text-gray-300">
            {t('jafarInstruction')}
          </p>
        ) : (
          <p className="text-gray-400">
            {t('othersWaitJafar')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-grow">
        {validTargets.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => isMirJafar && setSelected(p.id)}
              disabled={!isMirJafar}
              className={`relative p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                isSelected
                  ? 'border-red-500 bg-red-900/30'
                  : 'border-gray-700 bg-gray-800'
              } ${!isMirJafar && 'cursor-default opacity-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                isSelected ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className={`font-medium ${isSelected ? 'text-red-400' : 'text-gray-300'}`}>
                {p.name}
              </span>
              {isSelected && <Target className="w-6 h-6 text-red-500 absolute top-2 right-2" />}
            </button>
          );
        })}
      </div>

      {isMirJafar && (
        <button
          onClick={handleAssassinate}
          disabled={!selected}
          className="btn bg-red-600 hover:bg-red-500 text-white w-full py-4 text-xl font-bold tracking-wider uppercase mt-6 shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
        >
          <Skull className="w-6 h-6" />
          {t('assassinateTarget')}
        </button>
      )}
    </div>
  );
}
