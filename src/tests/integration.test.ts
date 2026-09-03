import { GameEngine } from '../game/gameEngine';
import { Player } from '../types/game';
import { assignRoles, canEditCode, canSabotage, canVote } from '../game/roles';
import { tickStateMachine, transitionToMeeting, transitionFromVoteReveal } from '../game/stateMachine';
import { calculateGameDuration, createInitialGameState } from '../game/gameState';
import { processPendingSabotageAlert } from '../game/sabotage';


function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Test Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

export function runPerson4IntegrationTests() {
  console.log('\n========================================');
  console.log('🎮 RUNNING PERSON 4 GAME ENGINE INTEGRATION TESTS');
  console.log('========================================\n');

  // Test 1: Player Setup and Role Assignment
  console.log('--- TEST SUITE 1: Roles & Permissions ---');
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Alice_Dev', role: 'DEVELOPER', status: 'ALIVE', isHost: true, connected: true, tasksCompletedCount: 0 },
    { id: 'p2', name: 'Bob_Dev', role: 'DEVELOPER', status: 'ALIVE', isHost: false, connected: true, tasksCompletedCount: 0 },
    { id: 'p3', name: 'Charlie_Imposter', role: 'DEVELOPER', status: 'ALIVE', isHost: false, connected: true, tasksCompletedCount: 0 },
    { id: 'p4', name: 'Diana_Dev', role: 'DEVELOPER', status: 'ALIVE', isHost: false, connected: true, tasksCompletedCount: 0 },
  ];

  const assigned = assignRoles(mockPlayers, 1);
  const mafiaPlayers = assigned.filter((p) => p.role === 'MAFIA');
  const devPlayers = assigned.filter((p) => p.role === 'DEVELOPER');

  assert(assigned.length === 4, 'All 4 players retained after role assignment');
  assert(mafiaPlayers.length === 1, 'Exactly 1 Imposter/Mafia assigned');
  assert(devPlayers.length === 3, 'Exactly 3 Developers assigned');

  // Test 2: Game Engine Lifecycle (LOBBY -> ROLE_REVEAL -> PLAYING)
  console.log('\n--- TEST SUITE 2: State Machine Lifecycle ---');
  const engine = new GameEngine('TEST-ROOM-1', mockPlayers[0]);
  mockPlayers.slice(1).forEach((p) => engine.dispatch({ type: 'JOIN_PLAYER', player: p }));

  assert(engine.getState().players.length === 4, '4 players joined in lobby');
  assert(engine.getState().phase === 'LOBBY', 'Initial phase is LOBBY');

  // Start game -> ROLE_REVEAL
  engine.startGame();
  assert(engine.getState().phase === 'ROLE_REVEAL', 'Transitioned to ROLE_REVEAL');
  assert(engine.getState().tasks.length === 5, '5 predefined tasks initialized in game');

  // Transition to PLAYING
  engine.dispatch({ type: 'TRANSITION_TO_PLAYING' });
  assert(engine.getState().phase === 'PLAYING', 'Transitioned to PLAYING phase');
  assert(engine.getState().progress === 0, 'Initial progress is 0%');

  // Test 3: Developer Solves Tasks
  console.log('\n--- TEST SUITE 3: Developer Solves Tasks ---');
  const dev = engine.getState().players.find((p) => p.role === 'DEVELOPER')!;
  const imposter = engine.getState().players.find((p) => p.role === 'MAFIA')!;

  assert(canEditCode(dev, engine.getState()), 'Developer can edit code in PLAYING phase');
  assert(!canSabotage(dev, engine.getState()), 'Developer cannot sabotage');
  assert(canSabotage(imposter, engine.getState()), 'Imposter can sabotage');

  // Developer solves task-auth
  const solveSuccess = engine.developerSolveTask(dev.id, 'task-auth');
  assert(solveSuccess, 'Developer successfully solved task-auth');
  assert(engine.getState().progress === 20, 'Progress increased to 20% after solving 1 of 5 tasks');

  const solvedTask = engine.getState().tasks.find((t) => t.id === 'task-auth')!;
  assert(solvedTask.status === 'COMPLETED', 'Task status is COMPLETED');

  // Test 4: Imposter Sabotage (1 Min Cooldown + 3s Escape Window + Red/Yellow Alarm)
  console.log('\n--- TEST SUITE 4: Imposter Sabotage (1 Min Cooldown & 3s Escape Window) ---');
  const buggedSuccess = engine.imposterBugTask(imposter.id, 'task-auth');
  assert(buggedSuccess, 'Imposter successfully bugged task-auth');

  // Cooldown check: Imposter cannot bug another task immediately (must wait 1 min)
  const immediateSecondBug = engine.imposterBugTask(imposter.id, 'task-utils');
  assert(!immediateSecondBug, 'Imposter cannot bug another task immediately (1 min cooldown active)');

  // 3-second escape window check: alarm is NOT yet visible to other crewmembers
  const preEscapeState = engine.getState();
  assert(preEscapeState.pendingSabotageAlert !== null, 'Sabotage alert is pending during 3s escape window');
  assert(preEscapeState.alarm === null, 'Alarm is silent during 3s escape window giving imposter time to leave');

  // Fast forward past the 3-second escape window
  const afterEscapeTime = Date.now() + 4000;
  const alertedState = processPendingSabotageAlert(engine.getState(), afterEscapeTime);
  engine.dispatch({ type: 'UPDATE_SETTINGS', settings: {} }); // apply state change or replace state
  // Manually update engine state for testing delayed trigger
  (engine as any).state = alertedState;

  const currentState = engine.getState();
  assert(currentState.progress === 0, 'Progress dropped back to 0% after bug injection');
  assert(currentState.alarm !== null, 'Alarm activated after 3s escape window elapsed');
  assert(currentState.alarm?.type === 'RED_YELLOW_ALERT', 'Alarm type is RED_YELLOW_ALERT');
  assert(currentState.alarm?.overlayStyle === 'translucent-red-yellow', 'Alarm overlay style is translucent-red-yellow');

  // Mystery Check: Developer scoped view masks the bugged task ID
  const devView = engine.getScopedStateForPlayer(dev.id);
  const devAuthTask = devView.tasks.find((t) => t.id === 'task-auth')!;
  assert(devAuthTask.status !== 'BUGGED', 'Developer scoped view hides direct BUGGED indicator so they must test');

  // Developer inspects code, runs deterministic test, and fixes it again
  console.log('\n--- TEST SUITE 5: Developer Locates and Re-fixes Bug ---');
  const fixSuccess = engine.developerSolveTask(dev.id, 'task-auth');
  assert(fixSuccess, 'Developer re-solved task-auth');
  assert(engine.getState().progress === 20, 'Progress restored to 20%');

  // Test 6: Emergency Meeting, Discussion, Voting, and Elimination
  console.log('\n--- TEST SUITE 6: Emergency Meeting & Voting ---');
  const meetingSuccess = engine.callEmergencyMeeting(dev.id, 'Spotted Imposter corrupting auth!');
  assert(meetingSuccess, 'Emergency meeting called successfully');
  assert(engine.getState().phase === 'MEETING', 'Phase is MEETING');
  assert(!canEditCode(dev, engine.getState()), 'Code editing is locked during emergency meeting');

  // Move to voting
  engine.dispatch({ type: 'START_VOTING' });
  assert(engine.getState().phase === 'VOTING', 'Phase transitioned to VOTING');

  // Players cast votes: Devs vote for Imposter, Imposter skips
  engine.vote(dev.id, imposter.id);
  const otherDevs = engine.getState().players.filter((p) => p.role === 'DEVELOPER' && p.id !== dev.id);
  otherDevs.forEach((d) => engine.vote(d.id, imposter.id));
  engine.vote(imposter.id, 'SKIP');

  const votingState = engine.getState().voting!;
  assert(votingState.isResolved, 'Voting automatically resolved when all alive players cast their vote');
  assert(votingState.eliminatedPlayerId === imposter.id, 'Imposter received majority votes and was eliminated');

  const eliminatedPlayer = engine.getState().players.find((p) => p.id === imposter.id)!;
  assert(eliminatedPlayer.status === 'ELIMINATED', 'Imposter status is now ELIMINATED (Ghost mode)');
  assert(!canVote(eliminatedPlayer, engine.getState()), 'Eliminated ghost cannot vote');
  assert(!canSabotage(eliminatedPlayer, engine.getState()), 'Eliminated ghost cannot sabotage');

  // Test 7: Victory Evaluation
  console.log('\n--- TEST SUITE 7: Victory Conditions ---');
  // Finish vote reveal
  engine.dispatch({ type: 'FINISH_VOTE_REVEAL' });
  assert(engine.getState().phase === 'GAME_OVER', 'Game ended because all Imposters were eliminated');
  assert(engine.getState().winner?.winner === 'DEVELOPERS', 'Developers win by ejecting the Imposter');

  // Test 8: Restart Game
  console.log('\n--- TEST SUITE 8: Restart Capability ---');
  engine.restartGame();
  assert(engine.getState().phase === 'LOBBY', 'Game cleanly restarted back to LOBBY');
  assert(engine.getState().progress === 0, 'Progress reset to 0%');

  // Test 9: Fallback Timers Deadlock Prevention
  console.log('\n--- TEST SUITE 9: Fallback Timers (No Deadlock) ---');
  let testState = engine.getState();
  testState = { ...testState, phase: 'ROLE_REVEAL', phaseTimer: 1 };
  testState = tickStateMachine(testState, 1);
  assert(testState.phase === 'PLAYING', 'Role reveal auto-transitions to PLAYING when timer expires');

  // Test 10: Dynamic Duration Calculation (Difficulty & Player Count)
  console.log('\n--- TEST SUITE 10: Dynamic Whole-Game Timer Calculation ---');
  const smallDuration = calculateGameDuration('SMALL', 4);
  assert(smallDuration === 600, 'Small code with 4 players is exactly 10 minutes (600s)');

  const diffDuration = calculateGameDuration('DIFFICULT', 4);
  assert(diffDuration === 900, 'Difficult code with 4 players is max 15 minutes (900s)');

  const fewerPlayersDuration = calculateGameDuration('SMALL', 2);
  assert(fewerPlayersDuration > 600, 'Fewer players (2 devs) receives more time buffer');

  const morePlayersDuration = calculateGameDuration('SMALL', 6);
  assert(morePlayersDuration < 600, 'More players (6 devs) scales down time for balance');

  // Test 11: Whole-Game Timer Runs, Pauses in Meetings, and Resumes
  console.log('\n--- TEST SUITE 11: Global Timer Pause in Meetings & Resumption ---');
  let timerState = createInitialGameState('ROOM-TIMER');
  timerState.players = mockPlayers;
  timerState.settings.difficulty = 'SMALL';
  timerState.phase = 'PLAYING';
  timerState.gameTimeRemaining = 600;
  timerState.isTimerPaused = false;

  // Tick 10 seconds in PLAYING
  timerState = tickStateMachine(timerState, 10);
  assert(timerState.gameTimeRemaining === 590, 'Global game timer ticked down by 10s during PLAYING phase');

  // Call emergency meeting -> Timer must pause!
  timerState = transitionToMeeting(timerState, mockPlayers[0].id, 'Check freeze');
  assert(timerState.phase === 'MEETING', 'In MEETING phase');
  assert(timerState.isTimerPaused === true, 'Global game timer is PAUSED during emergency meeting');

  // Tick 15 seconds while meeting is active
  timerState = tickStateMachine(timerState, 15);
  assert(timerState.gameTimeRemaining === 590, 'Global game timer REMAINED FROZEN at 590s during meeting');

  // Return from meeting back to PLAYING -> Timer must resume!
  timerState.phase = 'VOTE_REVEAL';
  timerState = transitionFromVoteReveal(timerState);
  assert(timerState.phase === 'PLAYING', 'Returned to PLAYING phase');
  assert(timerState.isTimerPaused === false, 'Global game timer is UNPAUSED and resumed');

  // Tick 5 seconds in PLAYING
  timerState = tickStateMachine(timerState, 5);
  assert(timerState.gameTimeRemaining === 585, 'Global game timer resumed ticking down to 585s');

  // Test 12: Global Timer Expiration triggers Imposter Victory
  console.log('\n--- TEST SUITE 12: Global Timer Expiration (Imposter Wins) ---');
  timerState.gameTimeRemaining = 1;
  timerState = tickStateMachine(timerState, 1);
  assert(timerState.phase === 'GAME_OVER', 'Timer running out triggers GAME_OVER');
  assert(timerState.winner?.winner === 'MAFIA', 'Mafia/Imposter wins when game timer expires');

  engine.stopTickLoop();

  console.log('\n========================================');
  console.log('🎉 ALL PERSON 4 INTEGRATION TESTS (INCLUDING TIMER) PASSED!');
  console.log('========================================\n');
}
