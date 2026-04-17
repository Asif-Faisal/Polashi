import { Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Identity({ gameState }) {
  const { me, knowledge } = gameState;
  const { t } = useLanguage();

  if (!me) return null;

  const isGood = me.faction === 'Good';

  return (
    <div className={`card overflow-hidden relative group border-2 border-gray-700 transition-colors duration-300 ${isGood ? 'hover:border-blue-500/50 active:border-blue-500/50' : 'hover:border-red-500/50 active:border-red-500/50'}`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gray-600 transition-colors duration-300 ${isGood ? 'group-hover:bg-blue-500 group-active:bg-blue-500' : 'group-hover:bg-red-500 group-active:bg-red-500'}`} />
      
      <h3 className="text-lg font-bold mb-4 text-center text-gray-300 group-hover:text-white transition-colors duration-300">{t('yourIdentity')}</h3>
      
      <div className="relative flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg border border-gray-700 mb-4 shadow-inner cursor-pointer min-h-[350px] overflow-hidden select-none">
        {/* Hidden Reveal State */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-active:opacity-100 scale-95 group-hover:scale-100 group-active:scale-100 z-10 bg-gray-900">
          {me.image && (
            <div className={`p-1 rounded-lg mb-3 ${isGood ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
              <img 
                src={`/cards/${me.image}.png`} 
                alt={me.role} 
                className="w-40 h-auto rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-gray-800"
              />
            </div>
          )}
          <span className={`text-sm uppercase tracking-widest font-bold mb-1 text-center ${isGood ? 'text-blue-400' : 'text-red-400'}`}>
            {isGood ? t('factionGood') : t('factionEvil')}
          </span>
          <span className="text-xl font-black text-white tracking-tight text-center leading-tight">
            {me.role}
          </span>
        </div>

        {/* Default Hidden State */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-100 transition-all duration-300 group-hover:opacity-0 group-active:opacity-0 pointer-events-none">
          <Eye className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
          <span className="text-gray-400 font-bold tracking-widest text-center uppercase text-sm">
            {t('tapToReveal')}
          </span>
        </div>
      </div>

      {knowledge && knowledge.knownEvil && knowledge.knownEvil.length > 0 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100">
          <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4" /> {t('secretKnowledge')}
          </h4>
          <p className="text-sm text-gray-300 mb-2">{t('knownEic')}</p>
          <div className="flex flex-wrap gap-2">
            {knowledge.knownEvil.map(name => (
              <span key={name} className="px-2 py-1 bg-red-500/20 text-red-200 text-xs rounded-md border border-red-500/30 font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {me.faction === 'Good' && me.role !== 'Mir Modon' && (
        <p className="text-xs text-gray-400 text-center mt-4 italic opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100">
          {t('noKnowledge')}
        </p>
      )}
    </div>
  );
}
