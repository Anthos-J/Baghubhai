import { create } from 'zustand';
import { Player, GamePhase, LocalSession, Task } from '../types/game';
import { updateRoomPhase, clearSession } from '../lib/roomService';
import { assignRoles } from '../game/roles';

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  color: string;
  text: string;
  timestamp: number;
}

export type MeetingSubPhase = 'DISCUSSION' | 'VOTING' | 'RESULTS';

export interface VotingResult {
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  eliminatedPlayerColor: string | null;
  wasImpostor: boolean;
  remainingImpostors: number;
  isTie: boolean;
  isSkip: boolean;
}

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

  // ── Game Timers & Meeting State ──
  gameTimeRemaining: number;
  isGameTimerPaused: boolean;
  meetingAlertActive: boolean;
  meetingCallerName: string;
  meetingSubPhase: MeetingSubPhase;
  meetingDiscussionTimer: number; // 180s (3m)
  meetingVotingTimer: number; // 60s (1m)
  meetingChatMessages: ChatMessage[];
  votes: Record<string, string>; // voterId -> targetPlayerId | 'SKIP'
  votingResult: VotingResult | null;

  // ── Session ──
  setSession: (session: LocalSession) => void;

  // ── Player management ──
  setRoomPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerPosition: (id: string, x: number, y: number, direction: Player['direction']) => void;
  updatePresence: (onlinePlayerIds: string[]) => void;

  // ── Game flow & Timers ──
  setGamePhase: (phase: GamePhase) => void;
  setInteractableRoom: (room: string | null) => void;
  startGame: () => void;
  callMeeting: () => void;
  tickGameTimer: () => void;
  setGameTimerPaused: (paused: boolean) => void;

  // ── Emergency & Meeting flow ──
  triggerEmergencyMeeting: (callerName?: string) => void;
  dismissMeetingAlert: () => void;
  setMeetingSubPhase: (subPhase: MeetingSubPhase) => void;
  tickMeetingTimer: () => void;
  addChatMessage: (message: ChatMessage) => void;
  castVote: (voterId: string, targetId: string | 'SKIP') => void;
  retractVote: (voterId: string) => void;
  resolveVotes: () => void;
  endMeeting: () => void;

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

  // ── Timers & Meeting State ──
  gameTimeRemaining: 900, // 15:00
  isGameTimerPaused: false,
  meetingAlertActive: false,
  meetingCallerName: '',
  meetingSubPhase: 'DISCUSSION',
  meetingDiscussionTimer: 180, // 3 min
  meetingVotingTimer: 60, // 1 min
  meetingChatMessages: [],
  votes: {},
  votingResult: null,

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

  // ── Game flow & Timers ──
  setGamePhase: (phase) => {
    set({
      gamePhase: phase,
      isGameTimerPaused: phase === 'MEETING' || phase === 'VOTING' || phase === 'LOBBY' || phase === 'ROLE_REVEAL',
    });
  },

  setInteractableRoom: (room) => set({ interactableRoom: room }),

  tickGameTimer: () => {
    const { gameTimeRemaining, isGameTimerPaused, gamePhase } = get();
    if (isGameTimerPaused || gamePhase !== 'PLAYING') return;
    if (gameTimeRemaining > 0) {
      set({ gameTimeRemaining: gameTimeRemaining - 1 });
    }
  },

  setGameTimerPaused: (paused) => set({ isGameTimerPaused: paused }),

  startGame: () => {
    const { roomId, players } = get();
    if (!roomId) return;

    // Reset game timer to 15 mins (900s) and assign roles if needed
    const assignedPlayers = players.some((p) => p.role === 'MAFIA')
      ? players
      : assignRoles(players, 1);

    set({
      players: assignedPlayers,
      gameTimeRemaining: 900,
      isGameTimerPaused: false,
      gamePhase: 'ROLE_REVEAL',
    });

    // Write to Supabase — all connected clients will receive
    // the phase change via the Realtime Postgres Changes listener
    updateRoomPhase(roomId, 'ROLE_REVEAL').then(() => {
      setTimeout(() => {
        updateRoomPhase(roomId, 'PLAYING');
      }, 4000);
    });

    setTimeout(() => {
      set({ gamePhase: 'PLAYING', isGameTimerPaused: false });
    }, 4000);
  },

  callMeeting: () => {
    const { session } = get();
    const callerName = session?.username || 'Crewmate';
    get().triggerEmergencyMeeting(callerName);
  },

  // ── Emergency & Meeting flow ──
  triggerEmergencyMeeting: (callerName) => {
    const { roomId, session, meetingAlertActive, gamePhase } = get();
    // Do not trigger if already in a meeting or alert is currently displaying
    if (meetingAlertActive || gamePhase === 'MEETING' || gamePhase === 'VOTING') {
      return;
    }

    const name = callerName || session?.username || 'Crewmate';

    set({
      meetingAlertActive: true,
      meetingCallerName: name,
      isGameTimerPaused: true,
      meetingSubPhase: 'DISCUSSION',
      meetingDiscussionTimer: 180,
      meetingVotingTimer: 60,
      votes: {},
      votingResult: null,
      gamePhase: 'MEETING',
      interactableRoom: null, // Clear interactable room so terminal isn't active
    });

    if (roomId) {
      updateRoomPhase(roomId, 'MEETING');
    }
  },

  dismissMeetingAlert: () => set({ meetingAlertActive: false }),

  setMeetingSubPhase: (subPhase) => set({ meetingSubPhase: subPhase }),

  tickMeetingTimer: () => {
    const { meetingSubPhase, meetingDiscussionTimer, meetingVotingTimer, gamePhase } = get();
    if (gamePhase !== 'MEETING' && gamePhase !== 'VOTING') return;

    if (meetingSubPhase === 'DISCUSSION') {
      if (meetingDiscussionTimer > 1) {
        set({ meetingDiscussionTimer: meetingDiscussionTimer - 1 });
      } else {
        // Auto transition to VOTING
        set({ meetingSubPhase: 'VOTING', meetingVotingTimer: 60 });
      }
    } else if (meetingSubPhase === 'VOTING') {
      if (meetingVotingTimer > 1) {
        set({ meetingVotingTimer: meetingVotingTimer - 1 });
      } else {
        // Voting timer expired -> resolve votes
        get().resolveVotes();
      }
    }
  },

  addChatMessage: (message) =>
    set((state) => ({
      meetingChatMessages: [...state.meetingChatMessages, message].slice(-100),
    })),

  castVote: (voterId, targetId) => {
    set((state) => {
      const nextVotes = { ...state.votes, [voterId]: targetId };
      const alivePlayers = state.players.filter((p) => p.alive);
      const totalVoted = Object.keys(nextVotes).length;

      // If everyone alive has voted, resolve votes early
      if (totalVoted >= alivePlayers.length && alivePlayers.length > 0) {
        setTimeout(() => {
          get().resolveVotes();
        }, 500);
      }

      return { votes: nextVotes };
    });
  },

  retractVote: (voterId) => {
    set((state) => {
      const nextVotes = { ...state.votes };
      delete nextVotes[voterId];
      return { votes: nextVotes };
    });
  },

  resolveVotes: () => {
    const { votes, players } = get();
    const tally: Record<string, number> = {};

    Object.values(votes).forEach((target) => {
      tally[target] = (tally[target] || 0) + 1;
    });

    let maxVotes = 0;
    let highestTarget: string | null = null;
    let isTie = false;

    for (const [target, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count;
        highestTarget = target;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    }

    const currentImpostorsCount = players.filter(
      (p) => p.alive && p.role === 'MAFIA'
    ).length;

    if (isTie || !highestTarget || highestTarget === 'SKIP') {
      set({
        meetingSubPhase: 'RESULTS',
        votingResult: {
          eliminatedPlayerId: null,
          eliminatedPlayerName: null,
          eliminatedPlayerColor: null,
          wasImpostor: false,
          remainingImpostors: currentImpostorsCount,
          isTie,
          isSkip: highestTarget === 'SKIP',
        },
      });
    } else {
      const eliminated = players.find((p) => p.id === highestTarget);
      const wasImpostor = eliminated?.role === 'MAFIA';
      const remainingImpostors = players.filter(
        (p) => p.alive && p.id !== highestTarget && p.role === 'MAFIA'
      ).length;

      set({
        meetingSubPhase: 'RESULTS',
        votingResult: {
          eliminatedPlayerId: highestTarget,
          eliminatedPlayerName: eliminated?.username || 'Unknown',
          eliminatedPlayerColor: eliminated?.color || '#00F0FF',
          wasImpostor,
          remainingImpostors,
          isTie: false,
          isSkip: false,
        },
        players: players.map((p) => (p.id === highestTarget ? { ...p, alive: false } : p)),
      });
    }

    // Auto resume game after 5 seconds of results
    setTimeout(() => {
      get().endMeeting();
    }, 5000);
  },

  endMeeting: () => {
    const { roomId } = get();
    set({
      gamePhase: 'PLAYING',
      isGameTimerPaused: false,
      meetingAlertActive: false,
      meetingSubPhase: 'DISCUSSION',
      meetingDiscussionTimer: 180,
      meetingVotingTimer: 60,
      votes: {},
      votingResult: null,
      interactableRoom: null,
    });

    if (roomId) {
      updateRoomPhase(roomId, 'PLAYING');
    }
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
      gameTimeRemaining: 900,
      isGameTimerPaused: false,
      meetingAlertActive: false,
      meetingCallerName: '',
      meetingSubPhase: 'DISCUSSION',
      meetingDiscussionTimer: 180,
      meetingVotingTimer: 60,
      meetingChatMessages: [],
      votes: {},
      votingResult: null,
    });
  },
}));
