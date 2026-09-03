import { create } from 'zustand';
import { Player, GamePhase, LocalSession, Task } from '../types/game';
import { updateRoomPhase, clearSession } from '../lib/roomService';

interface GameState {
  // ── Data ──
  players: Player[];
  session: LocalSession | null;
  roomId: string | null;
  roomCode: string | null;
  gamePhase: GamePhase;
  tasks: Task[];
  interactableRoom: string | null;
  isLoading: boolean;
  error: string | null;

  // ── Session ──
  setSession: (session: LocalSession) => void;

  // ── Player management ──
  setRoomPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerPosition: (id: string, x: number, y: number, direction: Player['direction']) => void;
  updatePresence: (onlinePlayerIds: string[]) => void;

  // ── Game flow ──
  setGamePhase: (phase: GamePhase) => void;
  setInteractableRoom: (room: string | null) => void;
  startGame: () => void;
  callMeeting: () => void;

  // ── UI state ──
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // ── Cleanup ──
  clearRoom: () => void;
}

export const useMockStore = create<GameState>((set, get) => ({
  // ── Initial state — NO mock data ──
  players: [],
  session: null,
  roomId: null,
  roomCode: null,
  gamePhase: 'LOBBY',
  tasks: [],
  interactableRoom: null,
  isLoading: false,
  error: null,

  // ── Session ──
  setSession: (session) =>
    set({
      session,
      roomId: session.roomId,
      roomCode: session.roomCode,
    }),

  // ── Player management ──
  setRoomPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => {
      // Prevent duplicates
      if (state.players.find((p) => p.id === player.id)) return state;
      return { players: [...state.players, player] };
    }),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  updatePlayerPosition: (id, x, y, direction) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, x, y, direction } : p
      ),
    })),

  updatePresence: (onlinePlayerIds) =>
    set((state) => ({
      players: state.players.map((p) => ({
        ...p,
        connected: onlinePlayerIds.includes(p.id),
      })),
    })),

  // ── Game flow ──
  setGamePhase: (phase) => set({ gamePhase: phase }),

  setInteractableRoom: (room) => set({ interactableRoom: room }),

  startGame: () => {
    const { roomId } = get();
    if (!roomId) return;

    // Write to Supabase — all connected clients will receive
    // the phase change via the Realtime Postgres Changes listener
    updateRoomPhase(roomId, 'ROLE_REVEAL').then(() => {
      // Transition to PLAYING after 4 seconds
      setTimeout(() => {
        updateRoomPhase(roomId, 'PLAYING');
      }, 4000);
    });

    // Also update local state immediately for the host
    set({ gamePhase: 'ROLE_REVEAL' });
    setTimeout(() => {
      set({ gamePhase: 'PLAYING' });
    }, 4000);
  },

  callMeeting: () => {
    const { roomId } = get();
    if (!roomId) return;

    updateRoomPhase(roomId, 'MEETING');
    set({ gamePhase: 'MEETING' });
  },

  // ── UI state ──
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // ── Cleanup ──
  clearRoom: () => {
    clearSession();
    set({
      players: [],
      session: null,
      roomId: null,
      roomCode: null,
      gamePhase: 'LOBBY',
      tasks: [],
      interactableRoom: null,
      isLoading: false,
      error: null,
    });
  },
}));
