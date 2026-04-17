import { useState } from 'react';
import { Users, UserPlus, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Lobby({ socket, gameState, setError }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    if (!name.trim()) return setError('Please enter a name');
    socket.emit('create_room', { playerName: name.trim() }, (res) => {
      if (res.error) setError(res.error);
      else {
        setError('');
        setIsJoined(true);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!name.trim()) return setError('Please enter a name');
    if (!roomCode.trim() || roomCode.length !== 4) return setError('Please enter a 4-letter room code');
    socket.emit('join_room', { roomCode: roomCode.trim().toUpperCase(), playerName: name.trim() }, (res) => {
      if (res.error) setError(res.error);
      else {
        setError('');
        setIsJoined(true);
      }
    });
  };

  const handleStartGame = () => {
    socket.emit('start_game', (res) => {
      if (res && res.error) setError(res.error);
    });
  };

  if (isJoined && gameState) {
    const isHost = gameState.me?.id === gameState.hostId;
    const canStart = isHost && gameState.players.length >= 5 && gameState.players.length <= 10;

    return (
      <div className="card space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{t('room')}: <span className="text-primary">{gameState.roomCode}</span></h2>
          <p className="text-gray-400">{t('shareCode')}</p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {t('players')}
            </h3>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {gameState.players.length} / 10
            </span>
          </div>
          
          <ul className="space-y-2">
            {gameState.players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-md border border-gray-600">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-lg">{p.name} {p.id === gameState.me?.id ? `(${t('you')})` : ''}</span>
                {p.isHost && <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded border border-yellow-500/30">{t('host')}</span>}
              </li>
            ))}
          </ul>
          
          {gameState.players.length < 5 && (
            <p className="text-center text-sm text-yellow-400 mt-4 italic">{t('waitingMin')}</p>
          )}
        </div>

        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 text-lg shadow-lg shadow-primary/20"
          >
            <Play className="w-5 h-5" />
            {t('startGame')}
          </button>
        ) : (
          <p className="text-center text-gray-400 animate-pulse">{t('waitingHost')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="card space-y-6 max-w-md mx-auto relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      
      <div className="space-y-4 relative z-10">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t('yourName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field text-lg"
            placeholder={t('enterAlias')}
            maxLength={15}
          />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button onClick={handleCreateRoom} className="w-full btn btn-primary flex items-center justify-center gap-2 mb-6">
            <UserPlus className="w-5 h-5" />
            {t('createNewRoom')}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">{t('or')}</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('joinExisting')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="input-field text-center tracking-widest uppercase font-mono text-xl w-full"
                placeholder="ABCD"
                maxLength={4}
              />
              <button onClick={handleJoinRoom} className="btn bg-gray-700 hover:bg-gray-600 text-white whitespace-nowrap">
                {t('join')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
