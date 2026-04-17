import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Voting({ socket, gameState, setError }) {
  const { proposedTeam, players, votes, me } = gameState;
  const [hasVoted, setHasVoted] = useState(false);
  const { t } = useLanguage();

  const teamNames = proposedTeam.map(id => players.find(p => p.id === id)?.name);

  // If votes is an object, voting is done and we can see results
  const isVotingComplete = !Array.isArray(votes);
  // If it's an array, it's just a list of player IDs who have voted
  const votedIds = Array.isArray(votes) ? votes : Object.keys(votes);
  const iHaveVoted = votedIds.includes(me?.id);

  const handleVote = useCallback((vote) => {
    socket.emit('vote_on_team', { vote }, (res) => {
      if (res && res.error) setError(res.error);
      else setHasVoted(true);
    });
  }, [socket, setError]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isVotingComplete || iHaveVoted || hasVoted) return;
      
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleVote('Approve');
      } else if (e.key === 'Shift') {
        e.preventDefault();
        handleVote('Reject');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVotingComplete, iHaveVoted, hasVoted, handleVote]);

  return (
    <div className="card h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t('voteOnTeam')}</h2>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {teamNames.map((name, i) => (
            <span key={i} className="px-3 py-1 bg-primary/20 text-primary-light border border-primary/30 rounded-full font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>

      {!isVotingComplete ? (
        <div className="flex-grow flex flex-col items-center justify-center space-y-8">
          {!iHaveVoted && !hasVoted ? (
            <div className="flex gap-4 w-full max-w-sm">
              <button
                onClick={() => handleVote('Approve')}
                className="flex-1 btn bg-green-600 hover:bg-green-500 text-white py-4 flex flex-col items-center gap-2"
              >
                <ThumbsUp className="w-6 h-6" />
                <span>{t('approve')}</span>
                <span className="text-xs opacity-75 hidden sm:block">(Space)</span>
              </button>
              <button
                onClick={() => handleVote('Reject')}
                className="flex-1 btn bg-red-600 hover:bg-red-500 text-white py-4 flex flex-col items-center gap-2"
              >
                <ThumbsDown className="w-6 h-6" />
                <span>{t('reject')}</span>
                <span className="text-xs opacity-75 hidden sm:block">(Shift)</span>
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-white">{t('voteCast')}</h3>
              <p className="text-gray-400">{t('waitingOthersVote')}</p>
            </div>
          )}
          
          <div className="w-full pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3 text-center">{t('votingProgress')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map(p => (
                <div key={p.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    votedIds.includes(p.id) ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-500'
                  }`}>
                    {votedIds.includes(p.id) ? <CheckCircle2 className="w-5 h-5" /> : '?'}
                  </div>
                  <span className="text-xs text-gray-400 truncate max-w-[60px]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-center mb-6">{t('votingResults')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {players.map(p => {
              const vote = votes[p.id];
              const isApprove = vote === 'Approve';
              return (
                <div key={p.id} className={`p-3 rounded-lg flex items-center justify-between border ${
                  isApprove ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
                }`}>
                  <span className="font-medium text-white">{p.name}</span>
                  <span className={`font-bold flex items-center gap-1 ${isApprove ? 'text-green-400' : 'text-red-400'}`}>
                    {isApprove ? <><ThumbsUp className="w-4 h-4"/> {t('approve')}</> : <><ThumbsDown className="w-4 h-4"/> {t('reject')}</>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
