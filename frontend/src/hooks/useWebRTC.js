import { useState, useEffect, useRef } from 'react';

export default function useWebRTC(socket, gameState) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [peerId]: MediaStream }
  const [micError, setMicError] = useState('');
  
  const peersRef = useRef({}); // { [peerId]: RTCPeerConnection }

  const myId = gameState?.me?.id;

  // 1. Get User Media
  useEffect(() => {
    if (!myId) return;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        // Disable mic initially for Push-To-Talk
        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
        setLocalStream(stream);
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
        setMicError('Microphone access denied or unavailable.');
      });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [myId]); // Only run once when we get our ID

  // Helper to create a new PeerConnection
  const createPeer = (peerId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    // Add local stream tracks to peer
    if (stream) {
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_signal', {
          targetId: peerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Handle incoming streams
    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: event.streams[0]
      }));
    };

    return peer;
  };

  // 2. Handle Game State Updates (New Players)
  useEffect(() => {
    if (!gameState || !localStream || !myId) return;

    gameState.players.forEach(p => {
      const peerId = p.id;
      if (peerId !== myId && !peersRef.current[peerId]) {
        // We have a new peer.
        // To avoid both creating offers, the one with the higher ID initiates
        const peer = createPeer(peerId, localStream);
        peersRef.current[peerId] = peer;

        if (myId > peerId) {
          peer.createOffer()
            .then(offer => peer.setLocalDescription(offer))
            .then(() => {
              socket.emit('webrtc_signal', {
                targetId: peerId,
                signal: { type: 'offer', offer: peer.localDescription }
              });
            })
            .catch(console.error);
        }
      }
    });
  }, [gameState, localStream, myId, socket]);

  // 3. Handle incoming signals
  useEffect(() => {
    if (!socket || !localStream) return;

    const handleSignal = async ({ senderId, signal }) => {
      let peer = peersRef.current[senderId];

      if (!peer) {
        // If we don't have a peer yet, create it
        peer = createPeer(senderId, localStream);
        peersRef.current[senderId] = peer;
      }

      try {
        if (signal.type === 'offer') {
          await peer.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('webrtc_signal', {
            targetId: senderId,
            signal: { type: 'answer', answer: peer.localDescription }
          });
        } else if (signal.type === 'answer') {
          await peer.setRemoteDescription(new RTCSessionDescription(signal.answer));
        } else if (signal.type === 'candidate') {
          await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('Error handling WebRTC signal', err);
      }
    };

    socket.on('webrtc_signal', handleSignal);

    return () => {
      socket.off('webrtc_signal', handleSignal);
    };
  }, [socket, localStream]);

  // 4. Cleanup disconnected peers
  useEffect(() => {
    if (!gameState) return;
    const currentPeerIds = gameState.players.map(p => p.id);
    
    Object.keys(peersRef.current).forEach(peerId => {
      if (!currentPeerIds.includes(peerId)) {
        peersRef.current[peerId].close();
        delete peersRef.current[peerId];
        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[peerId];
          return updated;
        });
      }
    });
  }, [gameState]);

  // Push-To-Talk API
  const startTalking = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
  };

  const stopTalking = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  };

  return { remoteStreams, startTalking, stopTalking, micError };
}
