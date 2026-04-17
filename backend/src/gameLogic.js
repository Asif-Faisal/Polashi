// The Resistance: Avalon mechanics
// 5 players: 3 Good, 2 Evil (2, 3, 2, 3, 3)
// 6 players: 4 Good, 2 Evil (2, 3, 4, 3, 4)
// 7 players: 4 Good, 3 Evil (2, 3, 3, 4*, 4)
// 8 players: 5 Good, 3 Evil (3, 4, 4, 5*, 5)
// 9 players: 6 Good, 3 Evil (3, 4, 4, 5*, 5)
// 10 players: 6 Good, 4 Evil (3, 4, 4, 5*, 5)

const QUEST_SIZES = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4], // chapter 4 needs 2 fails
  8: [3, 4, 4, 5, 5], // chapter 4 needs 2 fails
  9: [3, 4, 4, 5, 5], // chapter 4 needs 2 fails
  10: [3, 4, 4, 5, 5], // chapter 4 needs 2 fails
};

class GameRoom {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = []; // { id: socket.id, name: 'PlayerName', role: null, faction: null }
    this.phase = 'LOBBY'; // LOBBY, KNOWLEDGE, TEAM_SELECTION, VOTING, QUESTING, ASSASSINATION, GAME_OVER
    this.currentChapter = 0; // 0-4
    this.failedVotes = 0; // if reaches 5, Evil wins
    this.questResults = []; // true for success, false for fail
    this.senapatiIndex = 0; // index in players array
    this.proposedTeam = []; // array of player ids
    this.votes = {}; // playerId -> 'Approve' or 'Reject'
    this.questCards = []; // 'Success' or 'Betrayal'
    this.winner = null; // 'Nawab' or 'EIC'
    this.hostId = null;
  }

  addPlayer(id, name) {
    if (this.phase !== 'LOBBY') return { error: 'Game already in progress' };
    if (this.players.length >= 10) return { error: 'Room is full' };
    if (this.players.find(p => p.name === name)) return { error: 'Name already taken' };

    const player = { id, name, role: null, faction: null };
    this.players.push(player);
    if (!this.hostId) this.hostId = id;
    return { success: true };
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
    if (this.hostId === id && this.players.length > 0) {
      this.hostId = this.players[0].id; // Reassign host
    }
  }

  startGame() {
    if (this.players.length < 5 || this.players.length > 10) {
      return { error: 'Need between 5 and 10 players to start' };
    }

    const count = this.players.length;
    let numEvil = 2;
    if (count >= 7 && count <= 9) numEvil = 3;
    if (count === 10) numEvil = 4;
    const numGood = count - numEvil;

    let roles = [];
    roles.push({ faction: 'Good', role: 'Mir Modon', image: 'Nowab pokkho/mir_modon' });
    
    let goodCharacters = [
      { name: 'Lutfunnisa Begum', image: 'Nowab pokkho/lutfa' },
      { name: 'Mohon Lal', image: 'Nowab pokkho/mohon_lal' },
      { name: 'Nobab Sirajuddoula', image: 'Nowab pokkho/nobab' },
      { name: 'Saint frey', image: 'Nowab pokkho/saint_frey' }
    ];
    goodCharacters = goodCharacters.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numGood - 1; i++) {
        const char = goodCharacters[i % goodCharacters.length];
        roles.push({ faction: 'Good', role: char.name, image: char.image });
    }

    roles.push({ faction: 'Evil', role: 'Mir Jafar', image: 'EIC/mir_jafor' });
    
    let evilCharacters = [
      { name: 'Umichad', image: 'EIC/umichad' },
      { name: 'Ghoseti Begom', image: 'EIC/ghoseti' },
      { name: 'Ray Durlov', image: 'EIC/ray_durlov' }
    ];
    evilCharacters = evilCharacters.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numEvil - 1; i++) {
        const char = evilCharacters[i % evilCharacters.length];
        roles.push({ faction: 'Evil', role: char.name, image: char.image });
    }

    // Shuffle roles
    roles = roles.sort(() => Math.random() - 0.5);

    // Assign roles to players (randomly since roles are shuffled)
    this.players.forEach((p, index) => {
      p.role = roles[index].role;
      p.faction = roles[index].faction;
      p.image = roles[index].image;
    });

    this.phase = 'TEAM_SELECTION'; // Jump straight to team selection, Knowledge is handled in views
    this.senapatiIndex = Math.floor(Math.random() * count); // Random starting Senapati
    this.currentChapter = 0;
    this.failedVotes = 0;
    this.questResults = [];

    return { success: true };
  }

  getKnowledge(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase === 'LOBBY') return {};

    const evilPlayers = this.players.filter(p => p.faction === 'Evil').map(p => p.name);

    if (player.role === 'Mir Modon') {
      return { knownEvil: evilPlayers };
    }
    if (player.faction === 'Evil') {
      return { knownEvil: evilPlayers.filter(name => name !== player.name) }; // EIC knows other EIC
    }
    return {};
  }

  proposeTeam(playerId, teamIds) {
    if (this.phase !== 'TEAM_SELECTION') return { error: 'Not in team selection phase' };
    if (this.players[this.senapatiIndex].id !== playerId) return { error: 'You are not the Senapati' };
    
    const requiredSize = QUEST_SIZES[this.players.length][this.currentChapter];
    if (teamIds.length !== requiredSize) return { error: `Must select exactly ${requiredSize} players` };

    this.proposedTeam = teamIds;
    this.phase = 'VOTING';
    this.votes = {};
    return { success: true };
  }

  voteOnTeam(playerId, vote) {
    if (this.phase !== 'VOTING') return { error: 'Not in voting phase' };
    this.votes[playerId] = vote; // 'Approve' or 'Reject'

    if (Object.keys(this.votes).length === this.players.length) {
      // All votes in
      const approves = Object.values(this.votes).filter(v => v === 'Approve').length;
      if (approves > this.players.length / 2) {
        // Team approved
        this.phase = 'QUESTING';
        this.questCards = [];
        this.failedVotes = 0;
      } else {
        // Team rejected
        this.failedVotes++;
        if (this.failedVotes >= 5) {
          this.winner = 'EIC';
          this.phase = 'GAME_OVER';
        } else {
          this.nextSenapati();
          this.phase = 'TEAM_SELECTION';
          this.proposedTeam = [];
        }
      }
      return { success: true, votingComplete: true };
    }
    return { success: true, votingComplete: false };
  }

  submitQuestCard(playerId, card) {
    if (this.phase !== 'QUESTING') return { error: 'Not in questing phase' };
    if (!this.proposedTeam.includes(playerId)) return { error: 'You are not on the team' };

    const player = this.players.find(p => p.id === playerId);
    if (player.faction === 'Good' && card === 'Betrayal') {
       return { error: 'Good players cannot betray' };
    }

    this.questCards.push(card);

    if (this.questCards.length === this.proposedTeam.length) {
      // All cards in
      const betrayals = this.questCards.filter(c => c === 'Betrayal').length;
      
      let requiresTwoFails = false;
      if (this.players.length >= 7 && this.currentChapter === 3) {
        requiresTwoFails = true;
      }

      const isSuccess = requiresTwoFails ? betrayals < 2 : betrayals === 0;
      this.questResults.push(isSuccess);

      const successCount = this.questResults.filter(r => r === true).length;
      const failCount = this.questResults.filter(r => r === false).length;

      if (successCount === 3) {
        this.phase = 'ASSASSINATION';
      } else if (failCount === 3) {
        this.winner = 'EIC';
        this.phase = 'GAME_OVER';
      } else {
        this.currentChapter++;
        this.nextSenapati();
        this.phase = 'TEAM_SELECTION';
        this.proposedTeam = [];
      }
      return { success: true, questComplete: true, betrayals };
    }
    return { success: true, questComplete: false };
  }

  assassinate(playerId, targetId) {
    if (this.phase !== 'ASSASSINATION') return { error: 'Not in assassination phase' };
    const player = this.players.find(p => p.id === playerId);
    if (player.role !== 'Mir Jafar') return { error: 'Only Mir Jafar can assassinate' };

    const target = this.players.find(p => p.id === targetId);
    if (!target) return { error: 'Invalid target' };

    if (target.role === 'Mir Modon') {
      this.winner = 'EIC';
    } else {
      this.winner = 'Nawab';
    }
    this.phase = 'GAME_OVER';
    return { success: true };
  }

  nextSenapati() {
    this.senapatiIndex = (this.senapatiIndex + 1) % this.players.length;
  }

  resetGame() {
    this.phase = 'LOBBY';
    this.currentChapter = 0;
    this.failedVotes = 0;
    this.questResults = [];
    this.senapatiIndex = 0;
    this.proposedTeam = [];
    this.votes = {};
    this.questCards = [];
    this.winner = null;
    
    // Clear player roles
    this.players.forEach(p => {
      p.role = null;
      p.faction = null;
      p.image = null;
    });
    
    return { success: true };
  }

  getStateForPlayer(playerId) {
    // Only return what the client needs/is allowed to see
    const isGameOver = this.phase === 'GAME_OVER';
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.id === this.hostId,
        // Only reveal roles/factions if game is over
        role: isGameOver ? p.role : undefined,
        faction: isGameOver ? p.faction : undefined,
      })),
      me: this.players.find(p => p.id === playerId) ? {
        id: playerId,
        name: this.players.find(p => p.id === playerId).name,
        role: this.players.find(p => p.id === playerId).role,
        faction: this.players.find(p => p.id === playerId).faction,
        image: this.players.find(p => p.id === playerId).image,
      } : null,
      knowledge: this.getKnowledge(playerId),
      currentChapter: this.currentChapter,
      failedVotes: this.failedVotes,
      questResults: this.questResults,
      senapatiId: this.players.length > 0 ? this.players[this.senapatiIndex].id : null,
      proposedTeam: this.proposedTeam,
      votes: Object.keys(this.votes).length === this.players.length ? this.votes : Object.keys(this.votes), // Only show who voted, not what they voted until done
      winner: this.winner,
      requiredTeamSize: this.players.length > 0 && this.phase !== 'LOBBY' ? QUEST_SIZES[this.players.length][this.currentChapter] : 0,
      hostId: this.hostId
    };
  }
}

class GameManager {
  constructor() {
    this.rooms = {}; // roomCode -> GameRoom
    this.playerRooms = {}; // socketId -> roomCode
  }

  createRoom(socketId, playerName) {
    let roomCode = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    
    this.rooms[roomCode] = new GameRoom(roomCode);
    const result = this.rooms[roomCode].addPlayer(socketId, playerName);
    if (result.success) {
      this.playerRooms[socketId] = roomCode;
      return { success: true, roomCode };
    }
    return result;
  }

  joinRoom(socketId, roomCode, playerName) {
    const code = roomCode.toUpperCase();
    if (!this.rooms[code]) return { error: 'Room not found' };
    const result = this.rooms[code].addPlayer(socketId, playerName);
    if (result.success) {
      this.playerRooms[socketId] = code;
      return { success: true, roomCode: code };
    }
    return result;
  }

  getRoom(roomCode) {
    return this.rooms[roomCode.toUpperCase()];
  }

  getRoomByPlayer(socketId) {
    const code = this.playerRooms[socketId];
    return code ? this.rooms[code] : null;
  }

  removePlayer(socketId) {
    const roomCode = this.playerRooms[socketId];
    if (roomCode && this.rooms[roomCode]) {
      this.rooms[roomCode].removePlayer(socketId);
      delete this.playerRooms[socketId];
      if (this.rooms[roomCode].players.length === 0) {
        delete this.rooms[roomCode]; // Clean up empty rooms
      }
      return roomCode;
    }
    return null;
  }
}

module.exports = { GameManager };
