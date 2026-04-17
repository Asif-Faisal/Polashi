import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import useWebRTC from '../hooks/useWebRTC';
import { useLanguage } from '../contexts/LanguageContext';

export default function VoiceChat({ socket, gameState }) {
  const { remoteStreams, startTalking, stopTalking, micError } = useWebRTC(socket, gameState);
  const [isTalking, setIsTalking] = useState(false);
  const { t } = useLanguage();

  // Helper to render hidden audio tags for remote streams
  const AudioStream = ({ stream }) => {
    const audioRef = useRef(null);

    useEffect(() => {
      if (audioRef.current && stream) {
        audioRef.current.srcObject = stream;
      }
    }, [stream]);

    return <audio ref={audioRef} autoPlay playsInline className="hidden" />;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (micError) return;
    setIsTalking(true);
    startTalking();
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setIsTalking(false);
    stopTalking();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.repeat && !micError) {
        e.preventDefault();
        setIsTalking(true);
        startTalking();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsTalking(false);
        stopTalking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [micError, startTalking, stopTalking]);

  if (!gameState || !gameState.me) return null;

  return (
    <>
      {/* Hidden Audio Elements for Peers */}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <AudioStream key={peerId} stream={stream} />
      ))}

      {/* Floating Push-To-Talk Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative flex flex-col items-center">
          {micError && (
            <div className="absolute bottom-full mb-2 whitespace-nowrap bg-red-500/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <AlertCircle className="w-3 h-3" />
              {t('micBlocked')}
            </div>
          )}
          
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} // Stop if they drag mouse off
            onContextMenu={(e) => e.preventDefault()} // Prevent context menu on mobile long-press
            disabled={!!micError}
            className={`relative p-5 rounded-full shadow-2xl transition-all duration-200 select-none ${
              micError
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : isTalking
                  ? 'bg-red-500 text-white scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                  : 'bg-primary hover:bg-primary-dark text-white hover:scale-105'
            }`}
            title={t('holdToTalk')}
          >
            {isTalking ? (
              <Mic className="w-8 h-8 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
            
            {isTalking && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-50" />
            )}
          </button>
          
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max text-center pointer-events-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest drop-shadow-md">
              {isTalking ? t('transmitting') : t('holdToTalk')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
