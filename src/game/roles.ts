import { Player, PlayerRole, GameState } from '../types/game';

/**
 * Assigns roles randomly to players.
 * Ensures at least 1 Mafia / Imposter and the rest as Developers.
 */
export function assignRoles(players: Player[], mafiaCount: number = 1): Player[] {
  if (!players || players.length === 0) return [];

  // Clone array to avoid in-place mutation
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // Mafia count is at least 1, but cannot exceed players.length - 1
  const targetMafiaCount = Math.max(1, Math.min(mafiaCount, Math.floor(players.length / 2) || 1));

  return shuffled.map((player, index) => {
    const role: PlayerRole = index < targetMafiaCount ? 'MAFIA' : 'DEVELOPER';
    return {
      ...player,
      role,
      status: 'ALIVE',
      tasksCompletedCount: 0,
    };
  });
}

/**
 * Checks if a player can edit code in the IDE.
 * Ghosts cannot edit. Editing locked during meetings and voting.
 */
export function canEditCode(player: Player, state: GameState): boolean {
  if (!player || player.status !== 'ALIVE') return false;
  if (state.phase !== 'PLAYING') return false;
  return true;
}

/**
 * Checks if a player can trigger an Imposter sabotage.
 * Only living Mafia members can sabotage during the PLAYING phase.
 */
export function canSabotage(player: Player, state: GameState): boolean {
  if (!player || player.status !== 'ALIVE') return false;
  if (player.role !== 'MAFIA') return false;
  if (state.phase !== 'PLAYING') return false;
  return true;
}

/**
 * Checks if a player can call an Emergency Meeting.
 * Only living players can call a meeting during PLAYING phase.
 */
export function canCallMeeting(player: Player, state: GameState): boolean {
  if (!player || player.status !== 'ALIVE') return false;
  if (state.phase !== 'PLAYING') return false;
  if (state.meeting !== null) return false;
  return true;
}

/**
 * Checks if a player can cast a vote.
 * Only living players can vote during the VOTING phase.
 */
export function canVote(player: Player, state: GameState): boolean {
  if (!player || player.status !== 'ALIVE') return false;
  if (state.phase !== 'VOTING') return false;
  return true;
}

/**
 * Masks roles for a specific player's perspective.
 * Developers cannot see other players' roles.
 * Mafia members can see fellow Mafia members.
 */
export function getMaskedPlayersForClient(players: Player[], viewerId: string): Player[] {
  const viewer = players.find((p) => p.id === viewerId);
  const isViewerMafia = viewer?.role === 'MAFIA';

  return players.map((p) => {
    // If viewer is mafia, they know other mafia; otherwise role is masked unless it's their own
    if (p.id === viewerId) {
      return p;
    }
    if (isViewerMafia && p.role === 'MAFIA') {
      return p;
    }
    // Mask role as unknown / developer in frontend view
    return {
      ...p,
      role: 'DEVELOPER', // Hidden to keep secrets safe
    };
  });
}
