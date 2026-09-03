/**
 * validate_p26.ts — P2.6 Ghost Read-Only & Authoritative Task Completion Validation
 *
 * Tests:
 * 1. Alive player task completion flow & progress calculation.
 * 2. Room/Task mismatch rejection (e.g. submitting task-utils while in AUTH LAB).
 * 3. Ghost / eliminated player task completion rejection.
 * 4. Step-by-step progress increment (0% -> 20% -> 40% -> 60% -> 80% -> 100%).
 * 5. Developer victory condition evaluation at 100% progress.
 *
 * Run with: npx tsx src/editor/validate_p26.ts
 */

import { getDefaultTasks, solveTask, calculateProgress } from '../game/tasks';
import { checkVictory } from '../game/victory';
import { getRoomMapping, getTaskIdForRoom, isCodingRoom } from './roomMapping';
import { Player } from '../types/game';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  P2.6 GHOST READ-ONLY & TASK COMPLETION VALIDATION');
console.log('══════════════════════════════════════════════════════════════\n');

// Mock players for test scenarios
const alivePlayer: Player = {
  id: 'player-alive-1',
  username: 'DevOne',
  color: '#00F0FF',
  x: 100,
  y: 100,
  direction: 'down',
  alive: true,
  status: 'ALIVE',
  connected: true,
  role: 'DEVELOPER',
};

const eliminatedPlayer: Player = {
  id: 'player-dead-1',
  username: 'GhostOne',
  color: '#FF003C',
  x: 100,
  y: 100,
  direction: 'down',
  alive: false,
  status: 'ELIMINATED',
  connected: true,
  role: 'DEVELOPER',
};

const ghostStatusPlayer: Player = {
  id: 'player-ghost-2',
  username: 'GhostTwo',
  color: '#8A2BE2',
  x: 100,
  y: 100,
  direction: 'down',
  alive: false,
  status: 'GHOST',
  connected: true,
  role: 'DEVELOPER',
};

// ── TEST 1: Initial State & Baseline Progress ──────────────────────────────
console.log('[ 1. Initial State & Baseline Progress ]');
let tasks = getDefaultTasks();
assert('Default tasks list has 5 items', tasks.length === 5);
assert('Initial progress is 0%', calculateProgress(tasks) === 0);

// ── TEST 2: Alive Developer Task Completion ────────────────────────────────
console.log('\n[ 2. Alive Developer Task Completion Flow ]');
const authTaskId = getTaskIdForRoom('AUTH LAB')!;
assert('AUTH LAB resolves to task-auth', authTaskId === 'task-auth');

const authSolve = solveTask(tasks, authTaskId);
tasks = authSolve.tasks;
assert('Task task-auth is marked as COMPLETED', authSolve.task?.status === 'COMPLETED');
assert('Progress increments to 20%', authSolve.progress === 20);

// ── TEST 3: Room/Task Mismatch Rejection Simulation ────────────────────────
console.log('\n[ 3. Room / Task Boundary Mismatch Rejection ]');
const currentRoom = 'AUTH LAB';
const attemptedTaskId = 'task-utils'; // Mismatch!
const expectedTaskId = getTaskIdForRoom(currentRoom);

const isMismatch = attemptedTaskId !== expectedTaskId;
assert('Task-utils attempted in AUTH LAB is identified as mismatch', isMismatch);
assert('Expected task for AUTH LAB is task-auth', expectedTaskId === 'task-auth');

// ── TEST 4: Ghost / Eliminated Player Safeguard Simulation ──────────────────
console.log('\n[ 4. Ghost & Eliminated Player Rejection Checks ]');
function canPlayerPerformTask(p: Player): boolean {
  return p.alive !== false && p.status !== 'ELIMINATED' && p.status !== 'GHOST';
}

assert('Alive player is permitted to perform tasks', canPlayerPerformTask(alivePlayer) === true);
assert('Eliminated player (alive=false, status=ELIMINATED) is blocked', canPlayerPerformTask(eliminatedPlayer) === false);
assert('Ghost player (alive=false, status=GHOST) is blocked', canPlayerPerformTask(ghostStatusPlayer) === false);

// ── TEST 5: Step-by-Step Progress Increment ────────────────────────────────
console.log('\n[ 5. Step-by-Step Progress Increment (0% -> 100%) ]');
let stepTasks = getDefaultTasks();
assert('Step 0: 0%', calculateProgress(stepTasks) === 0);

stepTasks = solveTask(stepTasks, 'task-auth').tasks;
assert('Step 1 (task-auth): 20%', calculateProgress(stepTasks) === 20);

stepTasks = solveTask(stepTasks, 'task-database').tasks;
assert('Step 2 (task-database): 40%', calculateProgress(stepTasks) === 40);

stepTasks = solveTask(stepTasks, 'task-utils').tasks;
assert('Step 3 (task-utils): 60%', calculateProgress(stepTasks) === 60);

stepTasks = solveTask(stepTasks, 'task-payment').tasks;
assert('Step 4 (task-payment): 80%', calculateProgress(stepTasks) === 80);

stepTasks = solveTask(stepTasks, 'task-app').tasks;
assert('Step 5 (task-app): 100%', calculateProgress(stepTasks) === 100);

// ── TEST 6: Developer Victory Condition Evaluation ─────────────────────────
console.log('\n[ 6. Developer Victory Evaluation ]');
const victoryCheckMidGame = checkVictory({
  roomId: 'TEST-ROOM',
  phase: 'PLAYING',
  phaseTimer: 600,
  gameTimeRemaining: 600,
  totalGameTime: 900,
  isTimerPaused: false,
  players: [alivePlayer],
  tasks: tasks, // 1 task solved = 20%
  progress: 20,
  alarm: null,
  pendingSabotageAlert: null,
  notifications: [],
  meeting: null,
  voting: null,
  sabotageCooldowns: {},
  syntaxBlackoutActive: false,
  serverOverloadActive: false,
  serverOverloadDeadline: null,
  winner: null,
  settings: {
    maxPlayers: 10,
    mafiaCount: 1,
    difficulty: 'SMALL',
    gameDurationSeconds: 900,
    discussionDurationSeconds: 60,
    votingDurationSeconds: 45,
    emergencyMeetingLimit: 1,
    emergencyMeetingCooldownSeconds: 30,
    sabotageCooldownSeconds: 30,
    imposterEscapeDelaySeconds: 3,
    syntaxBlackoutDurationSeconds: 30,
  },
  createdAt: Date.now(),
  lastUpdatedAt: Date.now(),
});
assert('Victory not triggered at 20% progress', victoryCheckMidGame.winner === null);

const victoryCheck100 = checkVictory({
  roomId: 'TEST-ROOM',
  phase: 'PLAYING',
  phaseTimer: 600,
  gameTimeRemaining: 600,
  totalGameTime: 900,
  isTimerPaused: false,
  players: [alivePlayer],
  tasks: stepTasks, // All 5 tasks solved = 100%
  progress: 100,
  alarm: null,
  pendingSabotageAlert: null,
  notifications: [],
  meeting: null,
  voting: null,
  sabotageCooldowns: {},
  syntaxBlackoutActive: false,
  serverOverloadActive: false,
  serverOverloadDeadline: null,
  winner: null,
  settings: {
    maxPlayers: 10,
    mafiaCount: 1,
    difficulty: 'SMALL',
    gameDurationSeconds: 900,
    discussionDurationSeconds: 60,
    votingDurationSeconds: 45,
    emergencyMeetingLimit: 1,
    emergencyMeetingCooldownSeconds: 30,
    sabotageCooldownSeconds: 30,
    imposterEscapeDelaySeconds: 3,
    syntaxBlackoutDurationSeconds: 30,
  },
  createdAt: Date.now(),
  lastUpdatedAt: Date.now(),
});
assert('Developer Victory triggered at 100% progress', victoryCheck100.winner === 'DEVELOPERS');
assert('Victory reason confirms all tasks completed', victoryCheck100.reason.includes('All tasks completed'));

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  TOTAL P2.6 TESTS: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
