import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';
import VoiceChat from './components/VoiceChat';
import LanguageToggle from './components/LanguageToggle';
import AnimatedBackground from './components/AnimatedBackground';
import { Loader2, Crown } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

// Connect to backend on the same host but port 3001, or default to localhost
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setGameState(null); // Reset game state on disconnect
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
    });

    return () => newSocket.close();
  }, []);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">{t('connecting')}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 p-4 md:p-8 font-sans relative">
      <AnimatedBackground />
      <LanguageToggle />
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center pt-8">
          <div className="flex flex-col items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-500 mb-2 opacity-80" />
            <h1 
              className="text-5xl md:text-7xl mb-2 tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)] uppercase"
              style={{ fontFamily: "'Cinzel', serif", fontWeight: 900 }}
            >
              {t('title')}
            </h1>
            <div className="flex items-center gap-4 w-full max-w-xs mx-auto mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-yellow-500/80"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
            </div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">
            {t('subtitle')}
          </p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        {!gameState || gameState.phase === 'LOBBY' ? (
          <Lobby socket={socket} gameState={gameState} setError={setError} />
        ) : (
          <Game socket={socket} gameState={gameState} setError={setError} />
        )}
        
        {/* Render VoiceChat globally once joined */}
        {gameState && gameState.me && (
          <VoiceChat socket={socket} gameState={gameState} />
        )}
      </div>
    </div>
  );
}

export default App;
