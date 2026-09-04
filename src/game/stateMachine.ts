import { GameState, WinResult } from '../types/game';
import { assignRoles } from './roles';
import { getDefaultTasks, calculateProgress } from './tasks';
import { startEmergencyMeeting, startVotingPhase, resolveVotes } from './voting';
import { checkVictory } from './victory';
import { calculateGameDuration } from './gameState';
import { processPendingSabotageAlert } from './sabotage';


/**
 * Transitions from LOBBY to ROLE_REVEAL.
 * Assigns secret roles, initializes tasks, and computes the dynamic game duration.
 */
export function transitionToRoleReveal(state: GameState): GameState {
  if (state.phase !== 'LOBBY') return state;

  const maxAllowed = state.players.length >= 7 ? 2 : 1;
  const configuredMafia = state.settings?.mafiaCount ?? 1;
  const finalMafia = Math.max(1, Math.min(configuredMafia, maxAllowed));
  const playersWithRoles = assignRoles(state.players, finalMafia);
  const tasks = getDefaultTasks();
  const progress = calculateProgress(tasks);

  // Authoritative Host-selected Game Duration
  const duration = state.settings.gameDurationSeconds ?? 900;

  return {
    ...state,
    phase: 'ROLE_REVEAL',
    phaseTimer: 5, // 5 seconds for role reveal animation
    gameTimeRemaining: duration,
    totalGameTime: duration,
    isTimerPaused: false,
    players: playersWithRoles.map((p) => ({ ...p, meetingsCalledCount: 0 })),
    tasks,
    progress,
    alarm: null,
    meeting: null,
    voting: null,
    emergencyMeetingCooldownUntil: null,
    winner: null,
    syntaxBlackoutActive: false,
    serverOverloadActive: false,
    serverOverloadDeadline: null,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Transitions from ROLE_REVEAL to PLAYING.
 * Resumes / starts the global game timer.
 */
export function transitionToPlaying(state: GameState): GameState {
  return {
    ...state,
    phase: 'PLAYING',
    phaseTimer: state.gameTimeRemaining,
    isTimerPaused: false,
    meeting: null,
    voting: null,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Transitions from PLAYING to MEETING.
 * PAUSES the whole-game timer while discussion and voting occur.
 */
export function transitionToMeeting(state: GameState, callerId: string, reason?: string): GameState {
  const res = startEmergencyMeeting(state, callerId, reason);
  if (!res.success) return state;

  return {
    ...res.state,
    isTimerPaused: true, // Timer paused during emergency meeting
  };
}

/**
 * Transitions from MEETING to VOTING.
 * Timer remains paused.
 */
export function transitionToVoting(state: GameState): GameState {
  if (state.phase !== 'MEETING') return state;
  const votingState = startVotingPhase(state);
  return {
    ...votingState,
    isTimerPaused: true,
  };
}

/**
 * Transitions from VOTING to VOTE_REVEAL.
 * Timer remains paused.
 */
export function transitionToVoteReveal(state: GameState): GameState {
  if (state.phase !== 'VOTING') return state;
  const resolvedState = resolveVotes(state);
  return {
    ...resolvedState,
    isTimerPaused: true,
  };
}

/**
 * Transitions from VOTE_REVEAL to either PLAYING or GAME_OVER.
 * If returning to PLAYING, the whole-game timer RESUMES and emergency cooldown starts.
 */
export function transitionFromVoteReveal(state: GameState): GameState {
  if (state.phase !== 'VOTE_REVEAL') return state;

  // Check if someone won after the ejection
  const victory = checkVictory(state);
  if (victory.winner) {
    return transitionToGameOver(state, victory);
  }

  // Emergency cooldown starts when meeting ends
  const cooldownSec = state.settings.emergencyMeetingCooldownSeconds ?? 30;
  const emergencyMeetingCooldownUntil = Date.now() + cooldownSec * 1000;

  // Resume PLAYING with paused timer unpaused
  return {
    ...state,
    phase: 'PLAYING',
    phaseTimer: state.gameTimeRemaining,
    isTimerPaused: false, // Resume global timer
    meeting: null,
    voting: null,
    emergencyMeetingCooldownUntil,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Transitions to GAME_OVER.
 */
export function transitionToGameOver(state: GameState, victory: WinResult): GameState {
  return {
    ...state,
    phase: 'GAME_OVER',
    phaseTimer: 0,
    isTimerPaused: true,
    winner: victory,
    alarm: null,
    lastUpdatedAt: Date.now(),
  };
}

/**
 * Resets state back to LOBBY for a new match.
 */
export function transitionToLobby(state: GameState): GameState {
  const resetDuration = state.settings.gameDurationSeconds ?? 900;

  return {
    ...state,
    phase: 'LOBBY',
    phaseTimer: 0,
    gameTimeRemaining: resetDuration,
    totalGameTime: resetDuration,
    isTimerPaused: false,
    progress: 0,
    tasks: getDefaultTasks(),
    alarm: null,
    meeting: null,
    voting: null,
    emergencyMeetingCooldownUntil: null,
    winner: null,
    syntaxBlackoutActive: false,
    serverOverloadActive: false,
    serverOverloadDeadline: null,
    sabotageCooldowns: {},
    players: state.players.map((p) => ({
      ...p,
      status: 'ALIVE',
      tasksCompletedCount: 0,
      meetingsCalledCount: 0,
    })),
    lastUpdatedAt: Date.now(),
  };
}


/**
 * Heartbeat / Tick function called every second.
 * Evaluates fallback timers and auto-advances phases so game never deadlocks.
 * Pauses gameTimeRemaining during meetings and voting.
 */
export function tickStateMachine(state: GameState, deltaSeconds: number = 1): GameState {
  if (state.phase === 'LOBBY' || state.phase === 'GAME_OVER') {
    return state;
  }

  // Global game timer runs ONLY in PLAYING phase and when not paused
  let nextGameTimeRemaining = state.gameTimeRemaining;
  if (state.phase === 'PLAYING' && !state.isTimerPaused) {
    nextGameTimeRemaining = Math.max(0, state.gameTimeRemaining - deltaSeconds);
  }

  let nextState: GameState = {
    ...state,
    gameTimeRemaining: nextGameTimeRemaining,
    phaseTimer: state.phase === 'PLAYING' ? nextGameTimeRemaining : Math.max(0, state.phaseTimer - deltaSeconds),
  };

  // 1. Process 3-second sabotage escape window
  nextState = processPendingSabotageAlert(nextState);

  // 2. Evaluate Victory conditions on tick (100% progress, timeout, or overload)
  const victoryCheck = checkVictory(nextState);
  if (victoryCheck.winner) {
    return transitionToGameOver(nextState, victoryCheck);
  }

  // 2. Alarm expiration check
  if (nextState.alarm) {
    const elapsed = (Date.now() - nextState.alarm.startedAt) / 1000;
    if (elapsed >= nextState.alarm.durationSeconds) {
      nextState = {
        ...nextState,
        alarm: null,
      };
    }
  }

  // 3. Syntax blackout timer
  if (nextState.syntaxBlackoutActive && (!nextState.alarm || nextState.alarm.type !== 'SYNTAX_BLACKOUT')) {
    nextState = {
      ...nextState,
      syntaxBlackoutActive: false,
    };
  }

  // 4. Auto-advance phases on timer expiry
  if (nextState.phaseTimer <= 0) {
    switch (nextState.phase) {
      case 'ROLE_REVEAL':
        return transitionToPlaying(nextState);

      case 'MEETING':
        return transitionToVoting(nextState);

      case 'VOTING':
        return transitionToVoteReveal(nextState);

      case 'VOTE_REVEAL':
        return transitionFromVoteReveal(nextState);

      case 'PLAYING':
        return transitionToGameOver(nextState, {
          winner: 'MAFIA',
          reason: 'Time ran out! Development sprint expired before finding all bugs/imposters.',
          endedAt: Date.now(),
        });
    }
  }

  return nextState;
}
