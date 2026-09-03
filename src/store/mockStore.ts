import { create } from 'zustand';
import { Player, GamePhase, LocalSession, TaskItem } from '../types/game';
import { updateRoomPhase, clearSession } from '../lib/roomService';
import { getDefaultTasks, solveTask, bugTask } from '../game/tasks';
import { checkVictory } from '../game/victory';
import {
  PrivatePlayerTask,
  PublicProjectContext,
  PUBLIC_PROJECT_CONTEXT,
  fetchAuthorizedPlayerTasks,
  validateTaskModification,
} from '../editor/privateTasks';

interface GameState {
  // ── Data ──
  players: Player[];
  session: LocalSession | null;
  roomId: string | null;
  roomCode: string | null;
  gamePhase: GamePhase;
  tasks: TaskItem[];
  progress: number;
  interactableRoom: string | null;
  publicProject: PublicProjectContext;
  myPrivateTasks: PrivatePlayerTask[];
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
  completeTask: (taskId: string, playerId?: string, updatedCode?: string) => boolean;
  sabotageTask: (taskId: string) => boolean;
  assignTasks: () => void;

  // ── UI state ──
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // ── Cleanup ──
  clearRoom: () => void;
}

export const useMockStore = create<GameState>((set, get) => ({
  // ── Initial state ──
  players: [],
  session: null,
  roomId: null,
  roomCode: null,
  gamePhase: 'LOBBY',
  tasks: getDefaultTasks(),
  progress: 0,
  interactableRoom: null,
  publicProject: PUBLIC_PROJECT_CONTEXT,
  myPrivateTasks: [],
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
    const { roomId, players, session } = get();
    if (!roomId) return;

    // Fetch authorized tasks strictly for this client
    const playerIds = players.length > 0 ? players.map((p) => p.id) : [session?.playerId || 'local-player-1'];
    const localId = session?.playerId || playerIds[0];
    const res = fetchAuthorizedPlayerTasks(localId, localId, playerIds);
    if (res.success) {
      set({ myPrivateTasks: res.tasks });
    }

    updateRoomPhase(roomId, 'ROLE_REVEAL').then(() => {
      setTimeout(() => {
        updateRoomPhase(roomId, 'PLAYING');
      }, 4000);
    });

    set({ gamePhase: 'ROLE_REVEAL' });
    setTimeout(() => {
      set({ gamePhase: 'PLAYING' });
    }, 4000);
  },

  assignTasks: () => {
    const { players, session } = get();
    const playerIds = players.length > 0
      ? players.map((p) => p.id)
      : session?.playerId
      ? [session.playerId]
      : ['local-player-1'];
    const localId = session?.playerId || playerIds[0];

    // True Data Isolation: Requests and stores ONLY authorized tasks for the local player
    const res = fetchAuthorizedPlayerTasks(localId, localId, playerIds);
    if (res.success) {
      set({ myPrivateTasks: res.tasks });
    }
  },

  callMeeting: () => {
    const { roomId } = get();
    if (!roomId) return;

    updateRoomPhase(roomId, 'MEETING');
    set({ gamePhase: 'MEETING' });
  },

  completeTask: (taskId: string, playerId?: string, updatedCode?: string): boolean => {
    const state = get();

    // Check player eligibility if playerId is provided
    if (playerId) {
      const player = state.players.find((p) => p.id === playerId);
      if (player && (player.alive === false || player.status === 'ELIMINATED' || player.status === 'GHOST')) {
        console.warn('Rejected task completion: Player is eliminated or ghost.');
        return false;
      }

      // Security check: validate task modification authorization
      const auth = validateTaskModification(playerId, playerId);
      if (!auth.authorized) {
        console.warn(auth.error);
        return false;
      }
    }

    // Update authorized local private task
    const updatedMyTasks = state.myPrivateTasks.map((t) => {
      if (t.taskId === taskId) {
        return {
          ...t,
          status: 'COMPLETED' as const,
          sectionCode: updatedCode || t.sectionCode,
          completedAt: Date.now(),
        };
      }
      return t;
    });

    // Solve task using P4 tasks resolver
    const legacyTaskId = taskId.startsWith('task-') && !taskId.includes('-login') && !taskId.includes('-sort') && !taskId.includes('-connect') && !taskId.includes('-validate') && !taskId.includes('-ready')
      ? taskId
      : taskId.includes('auth')
      ? 'task-auth'
      : taskId.includes('util')
      ? 'task-utils'
      : taskId.includes('db') || taskId.includes('database')
      ? 'task-database'
      : taskId.includes('payment')
      ? 'task-payment'
      : 'task-app';

    const { tasks: nextTasks, progress: nextProgress } = solveTask(state.tasks, legacyTaskId);

    // Check victory condition
    const winResult = checkVictory({
      roomId: state.roomId || 'ROOM-1',
      phase: state.gamePhase,
      phaseTimer: 600,
      gameTimeRemaining: 900,
      totalGameTime: 900,
      isTimerPaused: false,
      players: state.players,
      tasks: nextTasks,
      progress: nextProgress,
      alarm: null,
      pendingSabotageAlert: null,
      notifications: [],
      meeting: null,
      voting: null,
      sabotageCooldowns: {},
      syntaxBlackoutActive: false,
      serverOverloadActive: false,
      serverOverloadDeadline: null,
      winner: null,
      settings: {
        gameDurationSeconds: 900,
        meetingDurationSeconds: 60,
        votingDurationSeconds: 45,
        sabotageCooldownSeconds: 30,
        serverOverloadResolutionTimeSeconds: 60,
        syntaxBlackoutDurationSeconds: 30,
      },
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
    });

    if (winResult.winner) {
      set({
        tasks: nextTasks,
        progress: nextProgress,
        myPrivateTasks: updatedMyTasks,
        gamePhase: 'GAME_OVER',
      });
      if (state.roomId) {
        updateRoomPhase(state.roomId, 'GAME_OVER');
      }
    } else {
      set({
        tasks: nextTasks,
        progress: nextProgress,
        myPrivateTasks: updatedMyTasks,
      });
    }

    return true;
  },

  sabotageTask: (taskId: string): boolean => {
    const state = get();

    // Mutate local private task if it matches the sabotaged task
    let found = false;
    const updatedMyTasks = state.myPrivateTasks.map((t) => {
      if (t.taskId === taskId || t.taskId.includes(taskId.replace('task-', ''))) {
        found = true;
        return {
          ...t,
          status: 'COMPROMISED' as const,
          sectionCode: t.baselineCode,
          compromisedAt: Date.now(),
        };
      }
      return t;
    });

    // Mutate P4 global task state
    const legacyTaskId = taskId.includes('auth')
      ? 'task-auth'
      : taskId.includes('util')
      ? 'task-utils'
      : taskId.includes('db') || taskId.includes('database')
      ? 'task-database'
      : taskId.includes('payment')
      ? 'task-payment'
      : 'task-app';

    const { tasks: nextTasks, progress: nextProgress } = bugTask(state.tasks, legacyTaskId);

    set({
      tasks: nextTasks,
      progress: nextProgress,
      myPrivateTasks: updatedMyTasks,
    });

    return found;
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
      tasks: getDefaultTasks(),
      progress: 0,
      interactableRoom: null,
      myPrivateTasks: [],
      isLoading: false,
      error: null,
    });
  },
}));

