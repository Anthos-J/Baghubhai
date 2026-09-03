import { GameState, WinResult } from '../types/game';

/**
 * Evaluates all victory conditions for the game.
 * Developers win:
 *   1. All tasks completed (100% progress).
 *   2. All Mafia/Imposters eliminated.
 * Mafia wins:
 *   1. Living Mafia >= Living Developers (parity).
 *   2. Game timer expires.
 *   3. Critical Server Overload timer expires.
 */
export function checkVictory(state: GameState): WinResult {
  // If game is in LOBBY or already GAME_OVER, return current winner
  if (state.phase === 'LOBBY') {
    return { winner: null, reason: 'Game in lobby' };
  }

  if (state.winner) {
    return state.winner;
  }

  const alivePlayers = state.players.filter(
    (p) => (p.status === 'ALIVE' || p.alive !== false) && p.status !== 'ELIMINATED' && p.status !== 'GHOST'
  );
  const aliveDevelopers = alivePlayers.filter((p) => p.role === 'DEVELOPER');
  const aliveMafia = alivePlayers.filter((p) => p.role === 'MAFIA');


  // 1. Check Developer Task Completion (100% progress)
  if (state.progress >= 100) {
    return {
      winner: 'DEVELOPERS',
      reason: 'All tasks completed! All bugs resolved and project deployed successfully.',
      endedAt: Date.now(),
    };
  }

  // 2. Check All Mafia Eliminated
  if (aliveMafia.length === 0 && state.players.some((p) => p.role === 'MAFIA')) {
    return {
      winner: 'DEVELOPERS',
      reason: 'All Imposters have been identified and ejected!',
      endedAt: Date.now(),
    };
  }

  // 3. Check Server Overload Deadline
  if (state.serverOverloadActive && state.serverOverloadDeadline) {
    if (Date.now() >= state.serverOverloadDeadline) {
      return {
        winner: 'MAFIA',
        reason: 'Server Overload! The production cluster crashed irreversibly.',
        endedAt: Date.now(),
      };
    }
  }

  // 4. Check Imposter Parity (Living Mafia >= Living Developers)
  // Only check if game has properly started and roles are assigned
  if (state.phase !== 'ROLE_REVEAL' && aliveMafia.length > 0 && aliveMafia.length >= aliveDevelopers.length) {
    return {
      winner: 'MAFIA',
      reason: 'Imposters have compromised the team! (Living Imposters >= Living Developers)',
      endedAt: Date.now(),
    };
  }

  // 5. Check Global Game Timeout
  if (state.phase === 'PLAYING' && (state.gameTimeRemaining <= 0 || state.phaseTimer <= 0)) {
    return {
      winner: 'MAFIA',
      reason: 'Sprint deadline reached! The team ran out of time to find the imposter and fix the codebase.',
      endedAt: Date.now(),
    };
  }

  return { winner: null, reason: 'Game ongoing' };
}
