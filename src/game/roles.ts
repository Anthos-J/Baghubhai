import { Player, PlayerRole, GameState } from '../types/game';

/**
 * Assigns roles randomly to players using uniform distribution.
 * Default is 1 Mafia, or whatever mafiaCount is passed.
 */
export function assignRoles(players: Player[], mafiaCount: number = 1): Player[] {
  if (!players || players.length === 0) return [];

  const maxAllowed = Math.max(1, Math.floor((players.length - 1) / 2) || 1);
  const finalMafiaCount = Math.max(1, Math.min(mafiaCount, maxAllowed));

  // Fisher-Yates shuffle for uniform probability distribution
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((player, index) => {
    const role: PlayerRole = index < finalMafiaCount ? 'MAFIA' : 'DEVELOPER';
    return {
      ...player,
      role,
      status: 'ALIVE',
      alive: true,
      username: player.username || player.name || `Player-${index + 1}`,
      tasksCompletedCount: 0,
    };
  });
}

function isAlive(player: Player): boolean {
  if (!player) return false;
  if (player.alive === false) return false;
  if (player.status === 'ELIMINATED' || player.status === 'GHOST') return false;
  return true;
}

/**
 * Checks if a player can edit code in the IDE.
 * Ghosts cannot edit. Editing locked during meetings and voting.
 */
export function canEditCode(player: Player, state: GameState): boolean {
  if (!isAlive(player)) return false;
  if (state.phase !== 'PLAYING') return false;
  return true;
}

/**
 * Checks if a player can trigger an Imposter sabotage.
 * Only living Mafia members can sabotage during the PLAYING phase.
 */
export function canSabotage(player: Player, state: GameState): boolean {
  if (!isAlive(player)) return false;
  if (player.role !== 'MAFIA') return false;
  if (state.phase !== 'PLAYING') return false;
  return true;
}

/**
 * Checks if a player can call an Emergency Meeting.
 * Only living players can call a meeting during PLAYING phase.
 */
export function canCallMeeting(player: Player, state: GameState): boolean {
  if (!isAlive(player)) return false;
  if (state.phase !== 'PLAYING') return false;
  if (state.meeting !== null) return false;
  return true;
}

/**
 * Checks if a player can cast a vote.
 */
export function canVote(player: Player, state: GameState): boolean {
  if (!isAlive(player)) return false;
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
