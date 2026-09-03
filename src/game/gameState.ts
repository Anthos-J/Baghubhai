export type { GameState, GameSettings, Player, TaskItem, GameAction } from '../types/game';
import type { GameState, GameSettings, Player, TaskItem, GameAction } from '../types/game';
import { getDefaultTasks, solveTask } from './tasks';
import { triggerBugInjection, triggerSyntaxBlackout, triggerServerOverload, resolveServerOverload, clearAlarm } from './sabotage';
import { startEmergencyMeeting, castVote } from './voting';
import { transitionToRoleReveal, transitionToPlaying, transitionToVoting, transitionToVoteReveal, transitionFromVoteReveal, transitionToGameOver, transitionToLobby, tickStateMachine } from './stateMachine';
import { checkVictory } from './victory';

/**
 * Calculates overall game duration based on:
 * 1. Code difficulty (SMALL: 10 min, MEDIUM: 12.5 min, DIFFICULT: max 15 min).
 * 2. Number of players in the game.
 */
export function calculateGameDuration(
  difficulty: 'SMALL' | 'MEDIUM' | 'DIFFICULT' = 'SMALL',
  playerCount: number = 4
): number {
  let baseSeconds: number;
  switch (difficulty) {
    case 'DIFFICULT':
      baseSeconds = 15 * 60; // 15 minutes max
      break;
    case 'MEDIUM':
      baseSeconds = 12.5 * 60; // 12.5 minutes
      break;
    case 'SMALL':
    default:
      baseSeconds = 10 * 60; // 10 minutes
      break;
  }

  // Player count adjustment (baseline 4 players)
  // Fewer players (+30s per player under 4)
  // More players (-20s per player above 4)
  const baselinePlayers = 4;
  const count = Math.max(2, playerCount || baselinePlayers);
  const diff = count - baselinePlayers;
  let adjustedSeconds = baseSeconds - (diff * 20);

  // Enforce boundary constraints
  if (difficulty === 'DIFFICULT') {
    adjustedSeconds = Math.min(15 * 60, Math.max(12 * 60, adjustedSeconds));
  } else if (difficulty === 'SMALL') {
    adjustedSeconds = Math.min(12 * 60, Math.max(8 * 60, adjustedSeconds));
  } else {
    adjustedSeconds = Math.min(14 * 60, Math.max(9 * 60, adjustedSeconds));
  }

  return Math.round(adjustedSeconds);
}

export const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 10,
  mafiaCount: 1,
  difficulty: 'SMALL',
  gameDurationSeconds: 600, // 10 minutes default
  discussionDurationSeconds: 40,
  votingDurationSeconds: 25,
  sabotageCooldownSeconds: 60, // 1 minute cooldown
  imposterEscapeDelaySeconds: 3, // 3 seconds escape window
  syntaxBlackoutDurationSeconds: 30,
};

/**
 * Creates a fresh GameState instance in the LOBBY phase.
 */
export function createInitialGameState(roomId: string = 'ROOM-1', hostPlayer?: Player): GameState {
  const initialPlayers: Player[] = hostPlayer ? [hostPlayer] : [];
  const initialTasks: TaskItem[] = getDefaultTasks();
  const initialDuration = calculateGameDuration('SMALL', initialPlayers.length);

  return {
    roomId,
    phase: 'LOBBY',
    phaseTimer: 0,
    gameTimeRemaining: initialDuration,
    totalGameTime: initialDuration,
    isTimerPaused: false,
    players: initialPlayers,
    tasks: initialTasks,
    progress: 0,
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
    settings: { ...DEFAULT_SETTINGS, gameDurationSeconds: initialDuration },
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };
}



/**
 * Central pure reducer managing all GameState transitions.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'JOIN_PLAYER': {
      if (state.phase !== 'LOBBY') return state;
      if (state.players.some((p) => p.id === action.player.id)) {
        return state;
      }
      return {
        ...state,
        players: [...state.players, action.player],
        lastUpdatedAt: Date.now(),
      };
    }

    case 'LEAVE_PLAYER': {
      const nextPlayers = state.players.filter((p) => p.id !== action.playerId);
      return {
        ...state,
        players: nextPlayers,
        lastUpdatedAt: Date.now(),
      };
    }

    case 'UPDATE_SETTINGS': {
      if (state.phase !== 'LOBBY') return state;
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
        lastUpdatedAt: Date.now(),
      };
    }

    case 'START_GAME': {
      return transitionToRoleReveal(state);
    }

    case 'TRANSITION_TO_PLAYING': {
      return transitionToPlaying(state);
    }

    case 'DEV_SOLVE_TASK': {
      if (state.phase !== 'PLAYING') return state;
      const solver = state.players.find((p) => p.id === action.playerId);
      if (!solver || solver.status !== 'ALIVE') return state;

      const { tasks, progress, task } = solveTask(state.tasks, action.taskId, action.code);
      if (!task) return state;

      const updatedPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? { ...p, tasksCompletedCount: (p.tasksCompletedCount ?? 0) + 1 }
          : p
      );

      const victory = checkVictory({ ...state, tasks, progress });
      let nextState: GameState = {
        ...state,
        tasks,
        progress,
        players: updatedPlayers,
        lastUpdatedAt: Date.now(),
      };

      if (victory.winner) {
        return transitionToGameOver(nextState, victory);
      }
      return nextState;
    }

    case 'IMPOSTER_BUG_TASK': {
      const res = triggerBugInjection(state, action.imposterId, action.taskId);
      return res.success ? res.state : state;
    }

    case 'TRIGGER_SYNTAX_BLACKOUT': {
      const res = triggerSyntaxBlackout(state, action.imposterId);
      return res.success ? res.state : state;
    }

    case 'TRIGGER_SERVER_OVERLOAD': {
      const res = triggerServerOverload(state, action.imposterId);
      return res.success ? res.state : state;
    }

    case 'RESOLVE_SERVER_OVERLOAD': {
      return resolveServerOverload(state, action.playerId);
    }

    case 'CLEAR_ALARM': {
      return clearAlarm(state);
    }

    case 'CALL_MEETING': {
      const res = startEmergencyMeeting(state, action.callerId, action.reason);
      return res.success ? res.state : state;
    }

    case 'START_VOTING': {
      return transitionToVoting(state);
    }

    case 'CAST_VOTE': {
      const res = castVote(state, action.voterId, action.targetId);
      if (res.success && res.allVoted) {
        // If all alive players have voted, immediately resolve votes
        return transitionToVoteReveal(res.state);
      }
      return res.success ? res.state : state;
    }

    case 'RESOLVE_VOTES': {
      return transitionToVoteReveal(state);
    }

    case 'FINISH_VOTE_REVEAL': {
      return transitionFromVoteReveal(state);
    }

    case 'TICK': {
      return tickStateMachine(state, action.deltaSeconds || 1);
    }

    case 'RESTART_GAME': {
      return transitionToLobby(state);
    }

    default:
      return state;
  }
}
