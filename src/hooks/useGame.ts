import { useMockStore } from '../store/mockStore';

export function useGame() {
  const gamePhase = useMockStore(state => state.gamePhase);
  const setGamePhase = useMockStore(state => state.setGamePhase);
  const startGame = useMockStore(state => state.startGame);
  const callMeeting = useMockStore(state => state.callMeeting);
  const interactableRoom = useMockStore(state => state.interactableRoom);

  return {
    gamePhase,
    setGamePhase,
    startGame,
    callMeeting,
    interactableRoom
  };
}
