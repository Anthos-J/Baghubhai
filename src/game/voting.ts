import { GameState, VotingState, GameNotification } from '../types/game';
import { canCallMeeting, canVote } from './roles';

/**
 * Initiates an Emergency Meeting.
 * Locks the code editor and starts the meeting discussion timer.
 */
export function startEmergencyMeeting(
  state: GameState,
  callerId: string,
  reason: string = 'Emergency Meeting Called'
): { success: boolean; state: GameState; reason?: string } {
  const caller = state.players.find((p) => p.id === callerId);
  if (!caller || !canCallMeeting(caller, state)) {
    return { success: false, state, reason: 'Unauthorized: Cannot call meeting.' };
  }

  const now = Date.now();
  const duration = state.settings.discussionDurationSeconds || 180;

  const notification: GameNotification = {
    id: `notif-${now}`,
    timestamp: now,
    message: `🚨 EMERGENCY MEETING called by ${caller.username || caller.name || 'Crewmate'}!`,
    level: 'warning',
    isGlobal: true,
  };

  const updatedPlayers = state.players.map((p) =>
    p.id === callerId ? { ...p, meetingsCalledCount: (p.meetingsCalledCount ?? 0) + 1 } : p
  );

  const nextState: GameState = {
    ...state,
    phase: 'MEETING',
    phaseTimer: duration,
    players: updatedPlayers,
    meeting: {
      callerId,
      callerName: caller.username || caller.name || 'Unknown',
      reason,
      startedAt: now,
      durationSeconds: duration,
    },
    // Clear transient alarms upon meeting
    alarm: null,
    emergencyMeetingCooldownUntil: null,
    notifications: [notification, ...state.notifications].slice(0, 50),
    lastUpdatedAt: now,
  };

  return { success: true, state: nextState };
}

/**
 * Transitions from MEETING discussion to VOTING phase.
 */
export function startVotingPhase(state: GameState): GameState {
  const now = Date.now();
  const duration = state.settings.votingDurationSeconds || 60;


  const initialVoting: VotingState = {
    startedAt: now,
    durationSeconds: duration,
    votes: {},
    isResolved: false,
    eliminatedPlayerId: null,
    eliminatedPlayerName: null,
    isTie: false,
    isSkip: false,
    voteCounts: {},
  };

  return {
    ...state,
    phase: 'VOTING',
    phaseTimer: duration,
    voting: initialVoting,
    lastUpdatedAt: now,
  };
}

/**
 * Casts a vote for a suspect or to SKIP.
 */
export function castVote(
  state: GameState,
  voterId: string,
  targetId: string | 'SKIP'
): { success: boolean; state: GameState; allVoted: boolean; reason?: string } {
  const voter = state.players.find((p) => p.id === voterId);
  if (!voter || !canVote(voter, state)) {
    return { success: false, state, allVoted: false, reason: 'Player cannot vote.' };
  }

  if (targetId !== 'SKIP') {
    const targetPlayer = state.players.find((p) => p.id === targetId);
    if (!targetPlayer || targetPlayer.status !== 'ALIVE') {
      return { success: false, state, allVoted: false, reason: 'Invalid target player.' };
    }
  }

  const currentVotes = { ...(state.voting?.votes || {}) };
  currentVotes[voterId] = targetId;

  const alivePlayers = state.players.filter((p) => p.status === 'ALIVE');
  const allVoted = alivePlayers.every((p) => currentVotes[p.id] !== undefined);

  const nextVoting: VotingState = {
    ...(state.voting as VotingState),
    votes: currentVotes,
  };

  const nextState: GameState = {
    ...state,
    voting: nextVoting,
    lastUpdatedAt: Date.now(),
  };

  return { success: true, state: nextState, allVoted };
}

/**
 * Resolves the votes, eliminates the player with the most votes,
 * or records a skip/tie. Transitions phase to VOTE_REVEAL.
 */
export function resolveVotes(state: GameState): GameState {
  if (!state.voting) return state;

  const votes = state.voting.votes;
  const alivePlayers = state.players.filter((p) => (p.status === 'ALIVE' || p.alive) && p.status !== 'ELIMINATED');

  // Count votes
  const counts: Record<string, number> = {};
  alivePlayers.forEach((p) => {
    counts[p.id] = 0;
  });
  counts['SKIP'] = 0;

  Object.values(votes).forEach((target) => {
    counts[target] = (counts[target] || 0) + 1;
  });

  // Determine highest vote recipient
  let highestCount = -1;
  let highestTargets: string[] = [];

  for (const [target, count] of Object.entries(counts)) {
    if (count > highestCount) {
      highestCount = count;
      highestTargets = [target];
    } else if (count === highestCount && count > 0) {
      highestTargets.push(target);
    }
  }

  let isTie = false;
  let isSkip = false;
  let eliminatedPlayerId: string | null = null;
  let eliminatedPlayerName: string | null = null;
  let eliminatedRole: undefined | 'DEVELOPER' | 'MAFIA' = undefined;

  let nextPlayers = [...state.players];

  if (highestTargets.length > 1 || highestCount === 0) {
    // Tie or no votes cast
    isTie = true;
  } else {
    const winnerTarget = highestTargets[0];
    if (winnerTarget === 'SKIP') {
      isSkip = true;
    } else {
      eliminatedPlayerId = winnerTarget;
      const targetPlayer = state.players.find((p) => p.id === winnerTarget);
      if (targetPlayer) {
        eliminatedPlayerName = targetPlayer.username || targetPlayer.name || 'Player';
        eliminatedRole = targetPlayer.role;

        // Eliminate player -> Ghost mode
        nextPlayers = state.players.map((p) =>
          p.id === winnerTarget
            ? { ...p, status: 'ELIMINATED' as const, alive: false }
            : p
        );
      }
    }
  }

  const now = Date.now();
  let resultMsg = 'No one was ejected. (Skipped)';
  if (isTie) {
    resultMsg = 'No one was ejected. (Tie vote)';
  } else if (eliminatedPlayerName) {
    resultMsg = `${eliminatedPlayerName} was ejected. They were ${eliminatedRole === 'MAFIA' ? 'an IMPOSTER' : 'a DEVELOPER'}.`;
  }

  const notification: GameNotification = {
    id: `notif-${now}`,
    timestamp: now,
    message: resultMsg,
    level: eliminatedRole === 'MAFIA' ? 'info' : 'warning',
    isGlobal: true,
  };

  const resolvedVoting: VotingState = {
    ...state.voting,
    isResolved: true,
    eliminatedPlayerId,
    eliminatedPlayerName,
    eliminatedRole,
    isTie,
    isSkip,
    voteCounts: counts,
  };

  return {
    ...state,
    phase: 'VOTE_REVEAL',
    phaseTimer: 7, // 7 seconds reveal animation
    players: nextPlayers,
    voting: resolvedVoting,
    notifications: [notification, ...state.notifications].slice(0, 50),
    lastUpdatedAt: now,
  };
}
