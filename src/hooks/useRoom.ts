import { useParams } from 'react-router-dom';
import { usePlayers } from './usePlayers';

export function useRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { players, localPlayer } = usePlayers();
  
  // A mock logic to determine if the local player is the host
  const isHost = localPlayer?.id === players[0]?.id;

  return {
    roomId,
    isHost,
    isConnected: true // Mocked connection status
  };
}
