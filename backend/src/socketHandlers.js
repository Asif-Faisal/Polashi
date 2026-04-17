const { GameManager } = require('./gameLogic');

const gameManager = new GameManager();

module.exports = function setupSocketHandlers(io) {
  
  const broadcastRoomState = (roomCode) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return;
    
    // Send tailored state to each player
    room.players.forEach(p => {
      io.to(p.id).emit('gameState', room.getStateForPlayer(p.id));
    });
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ playerName }, callback) => {
      const res = gameManager.createRoom(socket.id, playerName);
      if (res.error) {
        callback({ error: res.error });
      } else {
        socket.join(res.roomCode);
        callback({ success: true, roomCode: res.roomCode });
        broadcastRoomState(res.roomCode);
      }
    });

    socket.on('join_room', ({ roomCode, playerName }, callback) => {
      const res = gameManager.joinRoom(socket.id, roomCode, playerName);
      if (res.error) {
        callback({ error: res.error });
      } else {
        socket.join(res.roomCode);
        callback({ success: true, roomCode: res.roomCode });
        broadcastRoomState(res.roomCode);
      }
    });

    socket.on('start_game', (callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });
      if (room.hostId !== socket.id) return callback({ error: 'Only host can start game' });

      const res = room.startGame();
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        broadcastRoomState(room.roomCode);
      }
    });

    socket.on('propose_team', ({ teamIds }, callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });

      const res = room.proposeTeam(socket.id, teamIds);
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        broadcastRoomState(room.roomCode);
      }
    });

    socket.on('vote_on_team', ({ vote }, callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });

      const res = room.voteOnTeam(socket.id, vote);
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        if (res.votingComplete) {
          // Add a small delay so clients can see the final votes before phase change
          broadcastRoomState(room.roomCode);
          setTimeout(() => {
             // We've already updated the phase in logic, but client needs it
             broadcastRoomState(room.roomCode);
          }, 3000); // 3 second delay to view votes
        } else {
          broadcastRoomState(room.roomCode);
        }
      }
    });

    socket.on('submit_quest_card', ({ card }, callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });

      const res = room.submitQuestCard(socket.id, card);
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        if (res.questComplete) {
          // Tell everyone the result before switching phases
          io.to(room.roomCode).emit('quest_result', { betrayals: res.betrayals });
          setTimeout(() => {
            broadcastRoomState(room.roomCode);
          }, 4000); // 4 second delay to see results
        } else {
          broadcastRoomState(room.roomCode);
        }
      }
    });

    socket.on('assassinate_merlin', ({ targetId }, callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });

      const res = room.assassinate(socket.id, targetId);
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        broadcastRoomState(room.roomCode);
      }
    });

    socket.on('restart_game', (callback) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return callback({ error: 'Not in a room' });
      if (room.hostId !== socket.id) return callback({ error: 'Only host can restart game' });

      const res = room.resetGame();
      if (res.error) {
        callback({ error: res.error });
      } else {
        callback({ success: true });
        broadcastRoomState(room.roomCode);
      }
    });

    socket.on('webrtc_signal', ({ targetId, signal }) => {
      // Forward the signaling data to the specific peer
      io.to(targetId).emit('webrtc_signal', {
        senderId: socket.id,
        signal
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const roomCode = gameManager.removePlayer(socket.id);
      if (roomCode) {
        broadcastRoomState(roomCode);
      }
    });
  });
};
