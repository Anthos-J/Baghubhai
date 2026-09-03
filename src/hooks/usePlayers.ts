import { useMockStore } from '../store/mockStore';

export function usePlayers() {
  const players = useMockStore((state) => state.players);
  const session = useMockStore((state) => state.session);

  // The local player is found by matching the session's playerId
  const localPlayer = players.find((p) => p.id === session?.playerId);

  // Build a MyPlayerState-compatible object for backward compatibility
  const localPlayerState = session
    ? { playerId: session.playerId, role: null as 'DEVELOPER' | 'MAFIA' | null }
    : null;

  return {
    players,
    localPlayer,
    localPlayerState,
    alivePlayers: players.filter((p) => p.alive),
    deadPlayers: players.filter((p) => !p.alive),
  };
}
