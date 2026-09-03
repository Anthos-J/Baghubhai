import { create } from 'zustand';
import { Player, GamePhase, LocalSession, TaskItem, GameState as EngineGameState } from '../types/game';
import { updateRoomPhase, clearSession } from '../lib/roomService';
import { supabase } from '../lib/supabase';
import { GameAction, gameReducer, createInitialGameState } from '../game/gameState';

import { assignRoles } from '../game/roles';
import { DEFAULT_TASKS, getDefaultTasks, solveTask, bugTask } from '../game/tasks';
import { checkVictory } from '../game/victory';
import {
  PrivatePlayerTask,
  PublicProjectContext,
  PUBLIC_PROJECT_CONTEXT,
  fetchAuthorizedPlayerTasks,
  validateTaskModification,
} from '../editor/privateTasks';

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

interface GameStateStore {
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

  // ── UI Modal States ──
  editorOpen: boolean;
  mapOpen: boolean;

  // ── Engine Data ──
  engineState: EngineGameState;

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
  triggerEmergencyMeeting: (callerName?: string, isRemote?: boolean) => void;
  dismissMeetingAlert: () => void;
  setMeetingSubPhase: (subPhase: MeetingSubPhase) => void;
  tickMeetingTimer: () => void;
  addChatMessage: (message: ChatMessage) => void;
  castVote: (voterId: string, targetId: string | 'SKIP') => void;
  retractVote: (voterId: string) => void;
  resolveVotes: () => void;
  endMeeting: () => void;

  // ── Tasks ──
  completeTask: (taskId: string, playerId?: string, updatedCode?: string) => boolean;
  sabotageTask: (taskId: string) => boolean;
  assignTasks: () => void;

  // ── Sabotage, Escape Buffer & Red-Yellow Alarm ──
  alarmActive: boolean;
  alarmMessage: string;
  alarmRoomName: string;
  escapeBufferSeconds: number | null;
  mafiaNotifications: { id: string; message: string; roomName: string; timestamp: number }[];
  triggerAlarm: (roomName: string, message?: string) => void;
  clearAlarm: () => void;
  notifyMafiaTaskCompleted: (taskId: string, roomName: string, taskTitle: string) => void;
  triggerBugTaskAction: (taskId: string, roomName: string) => void;

  // ── UI state ──
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditorOpen: (open: boolean) => void;
  setMapOpen: (open: boolean) => void;

  // ── Engine Sync ──
  dispatchEngineAction: (action: GameAction) => void;
  setEngineState: (state: EngineGameState) => void;

  // ── Cleanup ──
  clearRoom: () => void;
}

export const useMockStore = create<GameStateStore>((set, get) => ({
  // ── Initial state — NO mock data ──
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
  editorOpen: false,
  mapOpen: false,
  
  engineState: createInitialGameState(),

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

  // ── Sabotage, Escape Buffer & Alarm ──
  alarmActive: false,
  alarmMessage: '',
  alarmRoomName: '',
  escapeBufferSeconds: null,
  mafiaNotifications: [],

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

  // ── Game flow & Timers ──
  setGamePhase: (phase) => {
    set((state) => {
      const nextEngine = {
        ...state.engineState,
        phase,
        phaseTimer: phase === 'PLAYING' ? (state.engineState.gameTimeRemaining || 900) : (phase === 'ROLE_REVEAL' ? 4 : state.engineState.phaseTimer),
        players: state.players.length > 0 ? state.players : state.engineState.players,
      };
      return {
        engineState: nextEngine,
        gamePhase: phase,
        isGameTimerPaused: phase === 'MEETING' || phase === 'VOTING' || phase === 'LOBBY' || phase === 'ROLE_REVEAL',
      };
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
    const { roomId, players, session } = get();
    if (!roomId) return;

    // Reset game timer to 15 mins (900s) and assign roles if needed
    const assignedPlayers = players.some((p) => p.role === 'MAFIA')
      ? players
      : assignRoles(players, 1);

    // Sync engine state to advance from LOBBY
    get().dispatchEngineAction({ type: 'START_GAME' });

    set({
      players: assignedPlayers,
      engineState: {
        ...get().engineState,
        phase: 'ROLE_REVEAL',
        phaseTimer: 4,
        players: assignedPlayers,
        gameTimeRemaining: 900,
        totalGameTime: 900,
        winner: null,
      },
      gameTimeRemaining: 900,
      isGameTimerPaused: false,
      gamePhase: 'ROLE_REVEAL',
    });

    // Fetch authorized tasks strictly for this client
    const playerIds = assignedPlayers.length > 0 ? assignedPlayers.map((p) => p.id) : [session?.playerId || 'local-player-1'];
    const localId = session?.playerId || playerIds[0];
    const res = fetchAuthorizedPlayerTasks(localId, localId, playerIds);
    if (res.success) {
      set({ myPrivateTasks: res.tasks });
    }

    // Write to Supabase — all connected clients will receive
    // the phase change via the Realtime Postgres Changes listener
    updateRoomPhase(roomId, 'ROLE_REVEAL').then(() => {
      setTimeout(() => {
        updateRoomPhase(roomId, 'PLAYING').catch(console.error);
      }, 4000);
    }).catch(console.error);

    setTimeout(() => {
      get().dispatchEngineAction({ type: 'TRANSITION_TO_PLAYING' });
      set({ gamePhase: 'PLAYING', isGameTimerPaused: false });
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
    const { session } = get();
    const callerName = session?.username || 'Crewmate';
    get().triggerEmergencyMeeting(callerName);
  },

  // ── Emergency & Meeting flow ──
  triggerEmergencyMeeting: (callerName?: string, isRemote: boolean = false) => {
    const { roomId, session } = get();

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

    if (roomId && !isRemote) {
      updateRoomPhase(roomId, 'MEETING');
      // Broadcast immediately so every player's screen pops up with the alert!
      supabase.channel(`room:${roomId}:events`).send({
        type: 'broadcast',
        event: 'emergency_meeting',
        payload: { callerName: name },
      });
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
        maxPlayers: 10,
        mafiaCount: 1,
        difficulty: 'SMALL',
        gameDurationSeconds: 900,
        discussionDurationSeconds: 60,
        votingDurationSeconds: 45,
        sabotageCooldownSeconds: 30,
        imposterEscapeDelaySeconds: 3,
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

    // Clear alarm if active
    if (state.alarmActive) {
      get().clearAlarm();
      if (state.roomId) {
        supabase.channel(`room:${state.roomId}:events`).send({
          type: 'broadcast',
          event: 'alarm_cleared',
          payload: {},
        });
      }
    }

    // Determine room label for the solved task
    const taskRoomName =
      legacyTaskId === 'task-auth'
        ? 'LIBRARY & ARCHIVES'
        : legacyTaskId === 'task-utils'
        ? 'STORAGE & CARGO'
        : legacyTaskId === 'task-database'
        ? 'MEDICAL BAY'
        : legacyTaskId === 'task-payment'
        ? 'DEV WORKSTATIONS'
        : 'COMMAND & TECH';

    const completedTaskTitle = nextTasks.find((t) => t.id === legacyTaskId)?.title || 'Code Task';

    // Broadcast task completion event so Mafia players receive alert
    if (state.roomId) {
      supabase.channel(`room:${state.roomId}:events`).send({
        type: 'broadcast',
        event: 'task_completed_event',
        payload: {
          taskId: legacyTaskId,
          roomName: taskRoomName,
          taskTitle: completedTaskTitle,
        },
      });
    }

    // Also notify local player if they are Mafia
    const localSessionPlayer = state.players.find((p) => p.id === state.session?.playerId);
    if (localSessionPlayer?.role === 'MAFIA') {
      get().notifyMafiaTaskCompleted(legacyTaskId, taskRoomName, completedTaskTitle);
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

  // ── Sabotage & Red-Yellow Alarm Handlers ──
  triggerAlarm: (roomName: string, message?: string) => {
    set({
      alarmActive: true,
      alarmRoomName: roomName,
      alarmMessage:
        message ||
        `CRITICAL ALERT: Code bugged in ${roomName}! Developers must resolve the issue!`,
    });
  },

  clearAlarm: () => {
    set({
      alarmActive: false,
      alarmMessage: '',
      alarmRoomName: '',
    });
  },

  notifyMafiaTaskCompleted: (taskId: string, roomName: string, taskTitle: string) => {
    const notif = {
      id: `mafia-notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      message: `Task solved in ${roomName}: "${taskTitle}"! Infiltrate and bug it!`,
      roomName,
      timestamp: Date.now(),
    };
    set((state) => ({
      mafiaNotifications: [notif, ...state.mafiaNotifications].slice(0, 5),
    }));
  },

  triggerBugTaskAction: (taskId: string, roomName: string) => {
    const state = get();
    const legacyTaskId = taskId.includes('auth')
      ? 'task-auth'
      : taskId.includes('util')
      ? 'task-utils'
      : taskId.includes('db') || taskId.includes('database')
      ? 'task-database'
      : taskId.includes('payment')
      ? 'task-payment'
      : 'task-app';

    // 1. Mutate task code and revert status to BUGGED
    const { tasks: updatedTasks, progress: updatedProgress } = bugTask(state.tasks, legacyTaskId);

    // 2. Start the 3-second escape buffer for Mafia
    set({
      tasks: updatedTasks,
      progress: updatedProgress,
      escapeBufferSeconds: 3,
    });

    let remaining = 3;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        set({ escapeBufferSeconds: remaining });
      } else {
        clearInterval(interval);
        set({ escapeBufferSeconds: null });

        // 3. After 3 seconds, sound global red-yellow alarm!
        get().triggerAlarm(
          roomName,
          `CRITICAL ALERT: Code bugged in ${roomName}! Developers must resolve the issue!`
        );

        // Broadcast to other players via Supabase realtime
        const { roomId } = get();
        if (roomId) {
          supabase.channel(`room:${roomId}:events`).send({
            type: 'broadcast',
            event: 'task_bugged_alarm',
            payload: {
              roomName,
              taskId: legacyTaskId,
              message: `CRITICAL ALERT: Code bugged in ${roomName}! Developers must resolve the issue!`,
            },
          });
        }
      }
    }, 1000);
  },

  // ── UI state ──
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setEditorOpen: (open) => set({ editorOpen: open }),
  setMapOpen: (open) => set({ mapOpen: open }),

  // ── Engine Sync ──
  dispatchEngineAction: (action) => {
    set((state) => {
      const nextEngine = gameReducer(state.engineState, action);
      return {
        engineState: nextEngine,
        gamePhase: nextEngine.phase,
      };
    });
  },
  
  setEngineState: (state) => set({ engineState: state, gamePhase: state.phase }),

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
      editorOpen: false,
      mapOpen: false,
      engineState: createInitialGameState(),
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
      alarmActive: false,
      alarmMessage: '',
      alarmRoomName: '',
      escapeBufferSeconds: null,
      mafiaNotifications: [],
    });
  },
}));

