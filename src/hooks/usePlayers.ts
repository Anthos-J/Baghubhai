import { useMockStore } from '../store/mockStore';

export function usePlayers() {
  const players = useMockStore(state => state.players);
  const localPlayerState = useMockStore(state => state.localPlayerState);
  
  // Helper to get the public Player object for the local player
  const localPlayer = players.find(p => p.id === localPlayerState?.playerId);

  return {
    players,
    localPlayer,
    localPlayerState,
    alivePlayers: players.filter(p => p.alive),
    deadPlayers: players.filter(p => !p.alive),
  };
}
