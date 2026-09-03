import { useMockStore } from '../store/mockStore';

export function useGame() {
  const gamePhase = useMockStore(state => state.gamePhase);
  const setGamePhase = useMockStore(state => state.setGamePhase);
  const startGame = useMockStore(state => state.startGame);
  const callMeeting = useMockStore(state => state.callMeeting);
  const interactableRoom = useMockStore(state => state.interactableRoom);
  const progress = useMockStore(state => state.progress);
  const tasks = useMockStore(state => state.tasks);
  const publicProject = useMockStore(state => state.publicProject);
  const myPrivateTasks = useMockStore(state => state.myPrivateTasks);
  const completeTask = useMockStore(state => state.completeTask);
  const sabotageTask = useMockStore(state => state.sabotageTask);
  const assignTasks = useMockStore(state => state.assignTasks);

  return {
    gamePhase,
    setGamePhase,
    startGame,
    callMeeting,
    interactableRoom,
    progress,
    tasks,
    publicProject,
    myPrivateTasks,
    completeTask,
    sabotageTask,
    assignTasks,
  };
}



