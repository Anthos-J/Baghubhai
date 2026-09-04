import { create } from 'zustand';
import { Player, GamePhase, LocalSession, TaskItem, GameState as EngineGameState, GameSettings } from '../types/game';
import { updateRoomPhase, clearSession, updateRoomSettings } from '../lib/roomService';
import { supabase } from '../lib/supabase';
import { GameAction, gameReducer, createInitialGameState } from '../game/gameState';

import { assignRoles, canCallMeeting } from '../game/roles';
import { DEFAULT_TASKS, getDefaultTasks, solveTask, bugTask } from '../game/tasks';
import { checkVictory } from '../game/victory';
import {
  PrivatePlayerTask,
  PublicProjectContext,
  PUBLIC_PROJECT_CONTEXT,
  fetchAuthorizedPlayerTasks,
  validateTaskModification,
} from '../editor/privateTasks';
import { triggerTrophyEvent } from '../lib/trophies';
import { CodeProject, DEFAULT_CODE_PROJECT, getRandomCodeProject } from '../editor/codeProjects';

/**
 * Calculates total cumulative tasks across all active developers/players in the room.
 */
export const computeTotalGameTasks = (players: Player[], baseTaskCount: number = 5): number => {
  const devs = players.filter((p) => p.role !== 'MAFIA');
  const count = devs.length > 0 ? devs.length : Math.max(1, players.length);
  return count * baseTaskCount;
};

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
  assignedCodeProject: CodeProject;
  setAssignedCodeProject: (project: CodeProject) => void;
  myPrivateTasks: PrivatePlayerTask[];
  // ── Cumulative Multi-Player Tasks ──
  completedTasksByPlayer: Record<string, string[]>;
  totalTasksCompleted: number;
  totalGameTasks: number;
  syncCumulativeTasks: (data: {
    completedTasksByPlayer?: Record<string, string[]>;
    totalTasksCompleted?: number;
    totalGameTasks?: number;
    progress?: number;
  }) => void;
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
  meetingCallerColor: string;
  meetingSubPhase: MeetingSubPhase;
  meetingDiscussionTimer: number; // dynamically driven by settings
  meetingVotingTimer: number; // dynamically driven by settings
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
  handleGameStartRoles: (assignedPlayers: Player[], totalGameTasks?: number, duration?: number, codeProject?: CodeProject) => void;
  triggerGameOver: (winner: 'DEVELOPERS' | 'MAFIA', reason: string, isRemote?: boolean) => void;
  playAgain: () => void;
  handlePlayAgainRemote: () => void;
  callMeeting: () => void;
  tickGameTimer: () => void;
  setGameTimerPaused: (paused: boolean) => void;

  // ── Emergency & Meeting flow ──
  triggerEmergencyMeeting: (callerName?: string, isRemote?: boolean, callerColor?: string) => void;
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

  // ── Engine Sync & Settings ──
  updateSettings: (settings: Partial<GameSettings>) => void;
  setRoomSettings: (settings: GameSettings) => void;
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
  assignedCodeProject: DEFAULT_CODE_PROJECT,
  myPrivateTasks: [],
  completedTasksByPlayer: {},
  totalTasksCompleted: 0,
  totalGameTasks: 5,
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
  meetingCallerColor: '',
  meetingSubPhase: 'DISCUSSION',
  meetingDiscussionTimer: 180, // 3 min
  meetingVotingTimer: 60, // 1 min
  meetingChatMessages: [],
  votes: {},
  votingResult: null,

  // ── Sabotage & Alarm initial state ──
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
  setRoomPlayers: (players) =>
    set((state) => ({
      players,
      engineState: {
        ...state.engineState,
        players,
      },
      totalGameTasks: computeTotalGameTasks(players, state.tasks.length),
    })),

  addPlayer: (player) =>
    set((state) => {
      if (state.players.find((p) => p.id === player.id)) return state;
      const nextPlayers = [...state.players, player];
      return {
        players: nextPlayers,
        engineState: {
          ...state.engineState,
          players: nextPlayers,
        },
      };
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
    if (gameTimeRemaining > 1) {
      set({ gameTimeRemaining: gameTimeRemaining - 1 });
    } else if (gameTimeRemaining === 1) {
      set({ gameTimeRemaining: 0 });
      get().triggerGameOver(
        'MAFIA',
        'Sprint deadline reached! The crewmates ran out of time to fix the codebase.'
      );
    }
  },

  setGameTimerPaused: (paused) => set({ isGameTimerPaused: paused }),

  startGame: () => {
    const { roomId, players, session, engineState } = get();
    if (!roomId) return;
    if (players.length < 4) return;

    // Validate and clamp mafia count based on actual players at game start (4-6 players -> 1 mafia, 7+ players -> 2 mafia)
    const maxAllowedMafia = players.length >= 7 ? 2 : 1;
    const configuredMafia = engineState.settings?.mafiaCount ?? 1;
    const finalMafia = Math.max(1, Math.min(configuredMafia, maxAllowedMafia));

    // Freshly assign roles to guarantee exactly finalMafia imposter(s) among players
    const assignedPlayers = assignRoles(players, finalMafia);

    // Randomly assign one code project for this match
    const assignedCodeProject = getRandomCodeProject();

    const duration = engineState.settings?.gameDurationSeconds ?? 900;

    // Sync engine state to advance from LOBBY
    get().dispatchEngineAction({ type: 'START_GAME' });

    const totalGameTasks = computeTotalGameTasks(assignedPlayers, 5);

    set({
      players: assignedPlayers.map((p) => ({ ...p, meetingsCalledCount: 0 })),
      assignedCodeProject,
      engineState: {
        ...get().engineState,
        phase: 'ROLE_REVEAL',
        phaseTimer: 4,
        players: assignedPlayers,
        gameTimeRemaining: duration,
        totalGameTime: duration,
        winner: null,
      },
      totalGameTasks,
      totalTasksCompleted: 0,
      completedTasksByPlayer: {},
      progress: 0,
      gameTimeRemaining: duration,
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

    // Persist assigned roles to Supabase database so all connected players and reconnects have authoritative role data
    Promise.all(
      assignedPlayers.map((p) =>
        supabase.from('players').update({ role: p.role, alive: true }).eq('id', p.id)
      )
    ).catch((err) => console.error('Failed to persist player roles to Supabase:', err));

    // Broadcast roles and assigned code project directly to all players via Realtime events channel for instantaneous sync
    supabase.channel(`room:${roomId}:events`).send({
      type: 'broadcast',
      event: 'game_start_roles',
      payload: {
        assignedPlayers,
        totalGameTasks,
        gameDurationSeconds: duration,
        finalMafia,
        codeProject: assignedCodeProject,
      },
    }).catch(console.error);

    // Advance room phase in Supabase — all clients receive the phase change
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

  handleGameStartRoles: (assignedPlayers, totalGameTasks, duration, codeProject) => {
    const { session, engineState } = get();
    const localId = session?.playerId || assignedPlayers[0]?.id;
    const playerIds = assignedPlayers.map((p) => p.id);
    const gameDuration = duration ?? engineState.settings?.gameDurationSeconds ?? 900;

    const res = fetchAuthorizedPlayerTasks(localId, localId, playerIds);

    set((state) => ({
      players: assignedPlayers.map((p) => ({ ...p, meetingsCalledCount: 0 })),
      assignedCodeProject: codeProject || state.assignedCodeProject || DEFAULT_CODE_PROJECT,
      engineState: {
        ...state.engineState,
        phase: 'ROLE_REVEAL',
        phaseTimer: 4,
        players: assignedPlayers,
        gameTimeRemaining: gameDuration,
        totalGameTime: gameDuration,
        winner: null,
      },
      totalGameTasks: totalGameTasks ?? computeTotalGameTasks(assignedPlayers, 5),
      totalTasksCompleted: 0,
      completedTasksByPlayer: {},
      progress: 0,
      gameTimeRemaining: gameDuration,
      isGameTimerPaused: false,
      gamePhase: 'ROLE_REVEAL',
      ...(res.success ? { myPrivateTasks: res.tasks } : {}),
    }));

    setTimeout(() => {
      set({ gamePhase: 'PLAYING', isGameTimerPaused: false });
    }, 4000);
  },

  setAssignedCodeProject: (project) => set({ assignedCodeProject: project }),

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
    const { session, players } = get();
    const callerName = session?.username || 'Crewmate';
    const callerColor = session?.color || players.find((p) => p.id === session?.playerId)?.color;
    get().triggerEmergencyMeeting(callerName, false, callerColor);
  },

  // ── Emergency & Meeting flow ──
  triggerEmergencyMeeting: (callerName?: string, isRemote: boolean = false, callerColor?: string) => {
    const { roomId, session, meetingAlertActive, gamePhase, engineState, players } = get();
    if (meetingAlertActive || gamePhase === 'MEETING' || gamePhase === 'VOTING') {
      return;
    }

    const localPlayer = players.find((p) => p.id === session?.playerId);
    if (!isRemote && localPlayer) {
      if (!canCallMeeting(localPlayer, engineState)) {
        console.warn('Emergency meeting blocked by cooldown or personal meeting limit.');
        return;
      }
    }

    const name = callerName || session?.username || 'Crewmate';
    const matchedPlayer = players.find(
      (p) => p.username.toLowerCase() === name.toLowerCase() || p.id === session?.playerId
    );
    const color = callerColor || matchedPlayer?.color || localPlayer?.color || session?.color || '#00F0FF';
    const discTime = engineState.settings?.discussionDurationSeconds ?? 180;
    const voteTime = engineState.settings?.votingDurationSeconds ?? 60;

    // Increment meetingsCalledCount for caller
    const nextPlayers = localPlayer && !isRemote
      ? players.map((p) => (p.id === localPlayer.id ? { ...p, meetingsCalledCount: (p.meetingsCalledCount ?? 0) + 1 } : p))
      : players;

    if (!isRemote) {
      triggerTrophyEvent('EMERGENCY_CALLED');
    }

    set({
      players: nextPlayers,
      meetingAlertActive: true,
      meetingCallerName: name,
      meetingCallerColor: color,
      isGameTimerPaused: true,
      meetingSubPhase: 'DISCUSSION',
      meetingDiscussionTimer: discTime,
      meetingVotingTimer: voteTime,
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
        payload: { callerName: name, callerColor: color },
      });
    }
  },

  dismissMeetingAlert: () => set({ meetingAlertActive: false }),

  setMeetingSubPhase: (subPhase) => set({ meetingSubPhase: subPhase }),

  tickMeetingTimer: () => {
    const { meetingSubPhase, meetingDiscussionTimer, meetingVotingTimer, gamePhase, engineState } = get();
    if (gamePhase !== 'MEETING' && gamePhase !== 'VOTING') return;

    if (meetingSubPhase === 'DISCUSSION') {
      if (meetingDiscussionTimer > 1) {
        set({ meetingDiscussionTimer: meetingDiscussionTimer - 1 });
      } else {
        // Auto transition to VOTING with configured voting timer
        const voteTime = engineState.settings?.votingDurationSeconds ?? 60;
        set({ meetingSubPhase: 'VOTING', meetingVotingTimer: voteTime });
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

      // Check if local player voted for this target
      const localId = get().session?.playerId;
      if (localId && votes[localId] === highestTarget) {
        if (wasImpostor) {
          triggerTrophyEvent('VOTED_MAFIA');
        } else if (eliminated?.role === 'DEVELOPER') {
          triggerTrophyEvent('VOTED_INNOCENT');
        }
      }

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
    const { roomId, engineState } = get();
    const cooldownSec = engineState.settings?.emergencyMeetingCooldownSeconds ?? 30;
    const emergencyMeetingCooldownUntil = Date.now() + cooldownSec * 1000;
    const discTime = engineState.settings?.discussionDurationSeconds ?? 180;
    const voteTime = engineState.settings?.votingDurationSeconds ?? 60;

    set({
      gamePhase: 'PLAYING',
      isGameTimerPaused: false,
      meetingAlertActive: false,
      meetingSubPhase: 'DISCUSSION',
      meetingDiscussionTimer: discTime,
      meetingVotingTimer: voteTime,
      votes: {},
      votingResult: null,
      interactableRoom: null,
      engineState: {
        ...engineState,
        phase: 'PLAYING',
        emergencyMeetingCooldownUntil,
      },
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

    const { tasks: nextTasks } = solveTask(state.tasks, legacyTaskId);
    const legacyTaskWasBugged = state.tasks.find((t) => t.id === legacyTaskId)?.status === 'BUGGED';

    // ── Cumulative Multi-Player Task Tracking ──
    const effectivePlayerId =
      playerId || state.session?.playerId || (state.players[0]?.id ?? 'local-player-1');
    const existingPlayerCompleted = state.completedTasksByPlayer[effectivePlayerId] || [];
    const updatedPlayerCompleted = existingPlayerCompleted.includes(legacyTaskId)
      ? existingPlayerCompleted
      : [...existingPlayerCompleted, legacyTaskId];

    const updatedCompletedTasksByPlayer: Record<string, string[]> = {
      ...state.completedTasksByPlayer,
      [effectivePlayerId]: updatedPlayerCompleted,
    };

    const personalCountTotal = Object.values(updatedCompletedTasksByPlayer).reduce(
      (sum, list) => sum + list.length,
      0
    );

    const totalGameTasks = Math.max(
      state.tasks.length,
      computeTotalGameTasks(state.players, state.tasks.length)
    );

    const newTotalCompleted = Math.min(
      totalGameTasks,
      legacyTaskWasBugged
        ? Math.max(state.totalTasksCompleted + 1, personalCountTotal)
        : Math.max(state.totalTasksCompleted + 1, personalCountTotal)
    );
    const cumulativeProgress = totalGameTasks > 0
      ? Math.min(100, Math.round((newTotalCompleted / totalGameTasks) * 100))
      : 0;

    // Trigger Developer Task trophies
    triggerTrophyEvent('TASK_COMPLETED');
    if (legacyTaskWasBugged) {
      triggerTrophyEvent('BUG_HUNTED');
    }

    // Check victory condition
    const winResult = checkVictory({
      ...state.engineState,
      roomId: state.roomId || 'ROOM-1',
      phase: state.gamePhase,
      players: state.players,
      tasks: nextTasks,
      progress: cumulativeProgress,
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
      triggerTrophyEvent('GAME_COMPLETED');
      const localPlayer = state.players.find((p) => p.id === state.session?.playerId);
      const isDev = localPlayer?.role === 'DEVELOPER';
      const isMafia = localPlayer?.role === 'MAFIA';
      const survived = localPlayer?.alive ?? true;

      if ((winResult.winner === 'DEVELOPERS' && isDev) || (winResult.winner === 'MAFIA' && isMafia)) {
        triggerTrophyEvent('GAME_WON');
      }
      if (survived) {
        triggerTrophyEvent('SURVIVED');
      }
      if (winResult.winner === 'MAFIA' && isMafia) {
        triggerTrophyEvent('MAFIA_WON');
        if (survived) {
          triggerTrophyEvent('MAFIA_UNDETECTED');
        }
      }
      // Note: checking `updatedMyTasks` requires it to be defined here, we will just pass updatedPrivateTasks.
      const updatedPrivateTasks = state.myPrivateTasks.map(t =>
        t.taskId === legacyTaskId ? { ...t, status: 'COMPLETED' as const } : t
      );
      if (winResult.winner === 'DEVELOPERS' && isDev && survived && updatedPrivateTasks.every((t) => t.status === 'COMPLETED')) {
        triggerTrophyEvent('PERFECT_DEV');
      }
    }

    if (winResult.winner || cumulativeProgress >= 100 || newTotalCompleted >= totalGameTasks) {
      set({
        tasks: nextTasks,
        progress: 100,
        totalTasksCompleted: newTotalCompleted,
        totalGameTasks,
        completedTasksByPlayer: updatedCompletedTasksByPlayer,
        myPrivateTasks: updatedMyTasks,
      });
      get().triggerGameOver(
        'DEVELOPERS',
        'All tasks completed! All bugs were fixed. Deployment successful.'
      );
    } else {
      set({
        tasks: nextTasks,
        progress: cumulativeProgress,
        totalTasksCompleted: newTotalCompleted,
        totalGameTasks,
        completedTasksByPlayer: updatedCompletedTasksByPlayer,
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

    // Broadcast task completion event with cumulative player progress
    if (state.roomId) {
      supabase.channel(`room:${state.roomId}:events`).send({
        type: 'broadcast',
        event: 'task_completed_event',
        payload: {
          taskId: legacyTaskId,
          roomName: taskRoomName,
          taskTitle: completedTaskTitle,
          playerId: effectivePlayerId,
          completedTasksByPlayer: updatedCompletedTasksByPlayer,
          totalTasksCompleted: newTotalCompleted,
          totalGameTasks,
          progress: cumulativeProgress,
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

    const { tasks: nextTasks } = bugTask(state.tasks, legacyTaskId);

    // Remove one solved occurrence of this task from cumulative completions
    let updatedCompletedTasksByPlayer = { ...state.completedTasksByPlayer };
    for (const [pId, taskList] of Object.entries(updatedCompletedTasksByPlayer)) {
      if (taskList.includes(legacyTaskId)) {
        updatedCompletedTasksByPlayer[pId] = taskList.filter((t) => t !== legacyTaskId);
        break;
      }
    }

    const newTotalCompleted = Object.values(updatedCompletedTasksByPlayer).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const totalGameTasks = Math.max(
      state.tasks.length,
      computeTotalGameTasks(state.players, state.tasks.length)
    );
    const cumulativeProgress = totalGameTasks > 0
      ? Math.min(100, Math.round((newTotalCompleted / totalGameTasks) * 100))
      : 0;

    set({
      tasks: nextTasks,
      progress: cumulativeProgress,
      totalTasksCompleted: newTotalCompleted,
      totalGameTasks,
      completedTasksByPlayer: updatedCompletedTasksByPlayer,
      myPrivateTasks: updatedMyTasks,
    });

    triggerTrophyEvent('SABOTAGE_TRIGGERED');
    return found;
  },

  // ── Sabotage & Red-Yellow Alarm Handlers ──
  triggerAlarm: (roomName: string, message?: string) => {
    set({
      alarmActive: true,
      alarmRoomName: roomName,
      alarmMessage:
        message ||
        'CRITICAL ALERT: Code defect detected! Developers must search facility rooms to locate and patch the bug!',
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

  triggerBugTaskAction: (taskId: string, _roomName: string) => {
    triggerTrophyEvent('SABOTAGE_TRIGGERED');
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
    const { tasks: updatedTasks } = bugTask(state.tasks, legacyTaskId);

    // 2. Personal tasks are NOT affected! Only total task bar decreases by 1
    const newTotalCompleted = Math.max(0, state.totalTasksCompleted - 1);
    const totalGameTasks = Math.max(
      state.tasks.length,
      computeTotalGameTasks(state.players, state.tasks.length)
    );
    const cumulativeProgress = totalGameTasks > 0
      ? Math.min(100, Math.round((newTotalCompleted / totalGameTasks) * 100))
      : 0;

    // 3. Start the 3-second escape buffer for Mafia
    set({
      tasks: updatedTasks,
      progress: cumulativeProgress,
      totalTasksCompleted: newTotalCompleted,
      totalGameTasks,
      completedTasksByPlayer: state.completedTasksByPlayer, // Personal tasks completely untouched!
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

        // 4. Sound global red-yellow alarm without revealing the room/code
        get().triggerAlarm(
          '',
          'CRITICAL ALERT: Terminal code bugged! Developers must search facility rooms to locate and patch the defect!'
        );

        // Broadcast to other players via Supabase realtime
        const { roomId } = get();
        if (roomId) {
          supabase.channel(`room:${roomId}:events`).send({
            type: 'broadcast',
            event: 'task_bugged_alarm',
            payload: {
              roomName: '',
              taskId: legacyTaskId,
              message: 'CRITICAL ALERT: Terminal code bugged! Developers must search facility rooms to locate and patch the defect!',
              completedTasksByPlayer: state.completedTasksByPlayer,
              totalTasksCompleted: newTotalCompleted,
              totalGameTasks,
              progress: cumulativeProgress,
            },
          });
        }
      }
    }, 1000);
  },

  syncCumulativeTasks: (data) => {
    const state = get();
    const completedTasksByPlayer = data.completedTasksByPlayer ?? state.completedTasksByPlayer;
    const totalTasksCompleted =
      data.totalTasksCompleted ??
      Object.values(completedTasksByPlayer).reduce((s, l) => s + l.length, 0);
    const totalGameTasks = data.totalGameTasks ?? state.totalGameTasks;
    const progress =
      data.progress ??
      (totalGameTasks > 0
        ? Math.min(100, Math.round((totalTasksCompleted / totalGameTasks) * 100))
        : 0);

    const isGameOver = progress >= 100 || (totalGameTasks > 0 && totalTasksCompleted >= totalGameTasks);

    set({
      completedTasksByPlayer,
      totalTasksCompleted,
      totalGameTasks,
      progress,
    });

    if (isGameOver) {
      get().triggerGameOver(
        'DEVELOPERS',
        'All tasks completed! All bugs were fixed. Deployment successful.'
      );
    }
  },

  // ── UI state ──
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setEditorOpen: (open) => set({ editorOpen: open }),
  setMapOpen: (open) => set({ mapOpen: open }),

  // ── Engine Sync & Settings ──
  updateSettings: (newSettings) => {
    const state = get();
    if (state.gamePhase !== 'LOBBY') return;
    const merged = { ...state.engineState.settings, ...newSettings };
    const duration = merged.gameDurationSeconds ?? 900;
    const nextEngine = {
      ...state.engineState,
      settings: merged,
      gameTimeRemaining: duration,
      totalGameTime: duration,
    };
    set({
      engineState: nextEngine,
      gameTimeRemaining: duration,
    });
    get().dispatchEngineAction({ type: 'UPDATE_SETTINGS', settings: newSettings });

    // Persist to Supabase and broadcast to other lobby clients
    if (state.roomId) {
      updateRoomSettings(state.roomId, merged, state.session?.playerId).catch((err) => {
        console.warn('Could not persist settings to Supabase:', err);
      });
      supabase.channel(`room:${state.roomId}:events`).send({
        type: 'broadcast',
        event: 'game_settings_update',
        payload: { settings: merged },
      });
    }
  },

  setRoomSettings: (settings) => {
    const state = get();
    const merged = { ...state.engineState.settings, ...settings };
    const duration = merged.gameDurationSeconds ?? 900;
    set({
      engineState: {
        ...state.engineState,
        settings: merged,
        gameTimeRemaining: duration,
        totalGameTime: duration,
      },
      gameTimeRemaining: duration,
    });
  },

  dispatchEngineAction: (action) => {
    set((state) => {
      const nextEngine = gameReducer(state.engineState, action);
      const isNowGameOver = nextEngine.phase === 'GAME_OVER' && state.gamePhase !== 'GAME_OVER';
      if (isNowGameOver && nextEngine.winner) {
        setTimeout(() => {
          get().triggerGameOver(nextEngine.winner?.winner || 'MAFIA', nextEngine.winner?.reason || 'Game over.');
        }, 0);
      }
      return {
        engineState: nextEngine,
        gamePhase: nextEngine.phase,
      };
    });
  },

  setEngineState: (state) =>
    set((s) => {
      const currentPlayers = s.players;
      let nextPlayers = currentPlayers;
      if (state.players && state.players.length > 0) {
        nextPlayers = currentPlayers.map((cp) => {
          const ep = state.players.find((p) => p.id === cp.id);
          return ep ? { ...cp, ...ep, role: ep.role ?? cp.role } : cp;
        });
      }
      return {
        engineState: state,
        gamePhase: state.phase,
        ...(state.players && state.players.length > 0 ? { players: nextPlayers } : {}),
      };
    }),

  triggerGameOver: (winner, reason, isRemote = false) => {
    const state = get();
    const winResult = {
      winner,
      reason,
      endedAt: Date.now(),
    };

    set((s) => ({
      gamePhase: 'GAME_OVER',
      isGameTimerPaused: true,
      engineState: {
        ...s.engineState,
        phase: 'GAME_OVER',
        winner: winResult,
        isTimerPaused: true,
      },
    }));

    if (!isRemote && state.roomId) {
      updateRoomPhase(state.roomId, 'GAME_OVER').catch(console.error);
      supabase.channel(`room:${state.roomId}:events`).send({
        type: 'broadcast',
        event: 'game_over_event',
        payload: { winner, reason },
      }).catch(console.error);
    }
  },

  playAgain: () => {
    const { roomId, players, engineState } = get();
    const duration = engineState.settings?.gameDurationSeconds ?? 900;
    const resetPlayers = players.map((p) => ({
      ...p,
      alive: true,
      status: 'ALIVE' as const,
      meetingsCalledCount: 0,
    }));

    set((s) => ({
      gamePhase: 'LOBBY',
      players: resetPlayers,
      engineState: {
        ...s.engineState,
        phase: 'LOBBY',
        players: resetPlayers,
        winner: null,
        gameTimeRemaining: duration,
        totalGameTime: duration,
        isTimerPaused: false,
        alarm: null,
        meeting: null,
        voting: null,
        emergencyMeetingCooldownUntil: null,
      },
      tasks: getDefaultTasks(),
      progress: 0,
      completedTasksByPlayer: {},
      totalTasksCompleted: 0,
      totalGameTasks: computeTotalGameTasks(resetPlayers, 5),
      myPrivateTasks: [],
      gameTimeRemaining: duration,
      isGameTimerPaused: false,
      meetingAlertActive: false,
      meetingCallerName: '',
      alarmActive: false,
      alarmMessage: '',
      alarmRoomName: '',
      escapeBufferSeconds: null,
      mafiaNotifications: [],
    }));

    if (roomId) {
      updateRoomPhase(roomId, 'LOBBY').catch(console.error);
      supabase.channel(`room:${roomId}:events`).send({
        type: 'broadcast',
        event: 'play_again_event',
        payload: {},
      }).catch(console.error);
    }
  },

  handlePlayAgainRemote: () => {
    const { players, engineState } = get();
    const duration = engineState.settings?.gameDurationSeconds ?? 900;
    const resetPlayers = players.map((p) => ({
      ...p,
      alive: true,
      status: 'ALIVE' as const,
      meetingsCalledCount: 0,
    }));

    set((s) => ({
      gamePhase: 'LOBBY',
      players: resetPlayers,
      engineState: {
        ...s.engineState,
        phase: 'LOBBY',
        players: resetPlayers,
        winner: null,
        gameTimeRemaining: duration,
        totalGameTime: duration,
        isTimerPaused: false,
        alarm: null,
        meeting: null,
        voting: null,
        emergencyMeetingCooldownUntil: null,
      },
      tasks: getDefaultTasks(),
      progress: 0,
      completedTasksByPlayer: {},
      totalTasksCompleted: 0,
      totalGameTasks: computeTotalGameTasks(resetPlayers, 5),
      myPrivateTasks: [],
      gameTimeRemaining: duration,
      isGameTimerPaused: false,
      meetingAlertActive: false,
      meetingCallerName: '',
      alarmActive: false,
      alarmMessage: '',
      alarmRoomName: '',
      escapeBufferSeconds: null,
      mafiaNotifications: [],
    }));
  },

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
      completedTasksByPlayer: {},
      totalTasksCompleted: 0,
      totalGameTasks: 5,
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
      meetingCallerColor: '',
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

