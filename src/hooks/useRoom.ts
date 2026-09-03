import { useParams } from 'react-router-dom';
import { useMockStore } from '../store/mockStore';

export function useRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const session = useMockStore((state) => state.session);

  return {
    roomId,
    isHost: session?.isHost ?? false,
    isConnected: !!session,
  };
}
