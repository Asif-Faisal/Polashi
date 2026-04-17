# Polashi

## Short Description
**Polashi** is a high-stakes strategy card game of betrayal and diplomacy, recreating the historical tensions of the 1757 Battle of Plassey. It is a real-time, web-based multiplayer social deduction game mechanically inspired by *The Resistance: Avalon*. Players are secretly divided into two factions: the loyal **Nowab pokkho** and the deceptive **East India Company**. Through strategic team-building, voting, and deduction, players must identify their allies and root out traitors before the rebellion is crushed.

## Project Structure
```text
AG_Polashi/
├── backend/               # Node.js server
│   ├── src/               # Server source code
│   │   ├── index.js       # Main entry point
│   │   ├── gameLogic.js   # Core game mechanics and state
│   │   └── socketHandlers.js # Socket.IO event listeners
│   └── package.json
├── frontend/              # React frontend application
│   ├── src/               # Client source code
│   │   ├── components/    # Reusable React components (UI, Game Board)
│   │   ├── contexts/      # React Contexts (e.g., Language Context)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── i18n/          # Internationalization (EN/BN translations)
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── cards/                 # Game card image assets
```

## Tech Stack
| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Socket.IO Client, Lucide React |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Network** | WebRTC (Peer-to-Peer Voice Chat) |

## Features
| Feature | Description |
| :--- | :--- |
| **Real-Time Multiplayer** | Built with Node.js and Socket.IO for seamless 5-10 player lobbies. |
| **In-Game Voice Chat** | Native peer-to-peer WebRTC mesh network featuring a Push-To-Talk mechanic. |
| **Bilingual Interface** | Fully supports English and Bengali (EN/BN) toggling on the fly. |
| **Historical Immersion** | Play as specific historical figures like Mir Modon, Umichad, or Mir Jafar with unique cinematic character cards. |
| **Intuitive Controls** | Push-to-talk functionality and keyboard-based voting for a smoother gameplay experience. |

## User Manual

### Running the Project Locally

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd AG_Polashi

# 2. Start the Backend server
cd backend
npm install
npm start  # Runs on port 3001

# 3. Start the Frontend development server (in a new terminal)
cd ../frontend
npm install
npm run dev # Runs on port 5173 (or 3000)

# 4. Play the Game
# Open the local URL (e.g., http://localhost:5173) in your web browser.
# For multiplayer, access the host's local network IP on all devices.
```

## Developer Info
- **Name:** MD Asif Faisal Palash
- **Department:** Computer Science and Engineering (CSE)
- **Institution:** Rajshahi University of Engineering & Technology (RUET)
