import { create } from 'zustand';
import { Player, GamePhase, MyPlayerState, Task } from '../types/game';

interface GameState {
  // Data
  players: Player[];
  localPlayerState: MyPlayerState | null;
  gamePhase: GamePhase;
  tasks: Task[];
  interactableRoom: string | null;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  updatePlayerPosition: (id: string, x: number, y: number, direction: Player['direction']) => void;
  setInteractableRoom: (room: string | null) => void;
  startGame: () => void;
  callMeeting: () => void;
}

// Initial mock data inside Cafeteria (Central Hub) center aisle
const MOCK_PLAYERS: Player[] = [
  { id: '1', username: 'Anthos', color: '#00F0FF', x: 1420, y: 975, direction: 'down', alive: true, connected: true },
  { id: '2', username: 'ByteNinja', color: '#FF003C', x: 1420, y: 920, direction: 'right', alive: true, connected: true },
  { id: '3', username: 'CyberPunk', color: '#00FF00', x: 1420, y: 1040, direction: 'left', alive: true, connected: true },
  { id: '4', username: 'Deface', color: '#8A2BE2', x: 1420, y: 860, direction: 'right', alive: true, connected: true },
  { id: '5', username: 'NullPtr', color: '#FFA500', x: 1420, y: 1100, direction: 'left', alive: true, connected: true },
];

export const useMockStore = create<GameState>((set) => ({
  players: MOCK_PLAYERS,
  localPlayerState: {
    playerId: '1',
    role: 'DEVELOPER'
  },
  gamePhase: 'LOBBY',
  tasks: [],
  interactableRoom: null,

  setGamePhase: (phase) => set({ gamePhase: phase }),
  
  updatePlayerPosition: (id, x, y, direction) => 
    set((state) => ({
      players: state.players.map(p => 
        p.id === id ? { ...p, x, y, direction } : p
      )
    })),
    
  setInteractableRoom: (room) => set({ interactableRoom: room }),

  startGame: () => {
    // Transition to role reveal
    set({ gamePhase: 'ROLE_REVEAL' });
    
    // Auto transition to playing after 4 seconds
    setTimeout(() => {
      set({ gamePhase: 'PLAYING' });
    }, 4000);
  },

  callMeeting: () => set({ gamePhase: 'MEETING' })
}));
