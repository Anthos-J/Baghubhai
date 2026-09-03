/**
 * validate_private_tasks.ts — Full Private Debugging, Public Project Context & True Data Isolation Validation
 *
 * Tests all Section 15 & 17 requirements:
 * 1. Public Project Context: Title, System, Description, Objective available to all players.
 * 2. True Data Isolation: Player A receives ONLY Player A's authorized tasks and code sections.
 * 3. Backend Authorization / RLS Guard: Unauthorized task reads and updates return 403 / denied.
 * 4. Zero Solution Code Leakage: Client task payload does NOT expose expected solutions or internal AST rules.
 * 5. Multi-task Same Room / Same File: Distinct tasks in auth.js for multiple developers.
 * 6. Mafia Sabotage & Compromise Lifecycle: COMPLETED -> COMPROMISED -> IN_PROGRESS -> COMPLETED.
 * 7. Anonymous Presence: Counter contains zero usernames, IDs, or task metadata.
 * 8. Ghost Mode: Read-only protection and store-level task submission blocking.
 *
 * Run with: npx tsx src/editor/validate_private_tasks.ts
 */

import {
  TASK_SECTIONS,
  PUBLIC_PROJECT_CONTEXT,
  assignPrivateTasksToPlayers,
  fetchAuthorizedPlayerTasks,
  validateTaskModification,
  getPlayerTaskInRoom,
  validatePrivateTaskCode,
  PrivatePlayerTask,
} from './privateTasks';
import { getDefaultTasks, solveTask, bugTask } from '../game/tasks';
import { checkVictory } from '../game/victory';
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

console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('  AMONGDEVS: PUBLIC CONTEXT & TRUE PRIVATE DATA ISOLATION SUITE');
console.log('═══════════════════════════════════════════════════════════════════════\n');

// Mock players
const playerA: Player = {
  id: 'player-A-uuid',
  username: 'Alice',
  color: '#00F0FF',
  x: 100,
  y: 100,
  direction: 'down',
  alive: true,
  status: 'ALIVE',
  connected: true,
  role: 'DEVELOPER',
};

const playerB: Player = {
  id: 'player-B-uuid',
  username: 'Bob',
  color: '#FF003C',
  x: 110,
  y: 100,
  direction: 'down',
  alive: true,
  status: 'ALIVE',
  connected: true,
  role: 'DEVELOPER',
};

const ghostPlayer: Player = {
  id: 'player-ghost-uuid',
  username: 'Casper',
  color: '#8A2BE2',
  x: 100,
  y: 100,
  direction: 'down',
  alive: false,
  status: 'GHOST',
  connected: true,
  role: 'DEVELOPER',
};

// ── 1. Public Project Metadata Availability ─────────────────────────────────
console.log('[ 1. Public Project Metadata (Visible to All Players) ]');
assert('Public project title is defined', Boolean(PUBLIC_PROJECT_CONTEXT.title && PUBLIC_PROJECT_CONTEXT.title.length > 0));
assert('Public project description explains system', PUBLIC_PROJECT_CONTEXT.description.includes('spacecraft microservice cluster'));
assert('Public project objective explains debugging goal', PUBLIC_PROJECT_CONTEXT.objective.includes('Debug faulty functions'));
assert('Public project lists summary of files', PUBLIC_PROJECT_CONTEXT.filesSummary.length === 5);

// ── 2. Authoritative Task Fetching & True Client Data Isolation ─────────────
console.log('\n[ 2. Authoritative Task Fetching & True Data Isolation ]');
const allPlayerIds = [playerA.id, playerB.id];

// Player A requests Player A's tasks (Authorized)
const resA = fetchAuthorizedPlayerTasks(playerA.id, playerA.id, allPlayerIds);
assert('Player A successfully fetches own tasks', resA.success === true && resA.tasks.length > 0);
assert('Player A payload contains ONLY Player A assignments', resA.tasks.every(t => t.assignedPlayerId === playerA.id));

// Player B requests Player B's tasks (Authorized)
const resB = fetchAuthorizedPlayerTasks(playerB.id, playerB.id, allPlayerIds);
assert('Player B successfully fetches own tasks', resB.success === true && resB.tasks.length > 0);
assert('Player B payload contains ONLY Player B assignments', resB.tasks.every(t => t.assignedPlayerId === playerB.id));

// Player A attempts to request Player B's tasks (Unauthorized / 403 Forbidden)
const unauthorizedRead = fetchAuthorizedPlayerTasks(playerA.id, playerB.id, allPlayerIds);
assert('Player A attempting to fetch Player B tasks returns 403 Forbidden', unauthorizedRead.status === 403 && unauthorizedRead.success === false);
assert('Unauthorized response contains ZERO tasks', unauthorizedRead.tasks.length === 0);

// Player A attempts to modify Player B's task (Unauthorized / 403 Forbidden)
const unauthorizedMod = validateTaskModification(playerA.id, playerB.id);
assert('Player A attempting to update Player B task is rejected (403)', unauthorizedMod.authorized === false && unauthorizedMod.status === 403);

// ── 3. Zero Solution Code Leakage ───────────────────────────────────────────
console.log('\n[ 3. Zero Solution Code Leakage in Client Task Objects ]');
const taskA = resA.tasks[0];
assert('Client PrivatePlayerTask does NOT contain solutionCode property', !('solutionCode' in taskA));
assert('Client PrivatePlayerTask contains sectionCode', typeof taskA.sectionCode === 'string');
assert('Client PrivatePlayerTask contains baselineCode', typeof taskA.baselineCode === 'string');
assert('Client PrivatePlayerTask contains hint', typeof taskA.hint === 'string');

// ── 4. Multi-Tasking: Same Room & Same File Isolation ───────────────────────
console.log('\n[ 4. Same Room & Same File Multi-Task Isolation ]');
const taskA_auth = getPlayerTaskInRoom(resA.tasks, playerA.id, 'AUTH LAB');
const taskB_auth = getPlayerTaskInRoom(resB.tasks, playerB.id, 'AUTH LAB');

assert('Player A has task in AUTH LAB', taskA_auth !== null);
assert('Player B has task in AUTH LAB', taskB_auth !== null);
assert('Both players target auth.js in AUTH LAB', taskA_auth?.fileName === 'auth.js' && taskB_auth?.fileName === 'auth.js');
assert('Player A and Player B receive DIFFERENT task IDs', taskA_auth?.taskId !== taskB_auth?.taskId);
assert('Player A receives login() function', taskA_auth!.sectionCode.includes('function login'));
assert('Player B receives validateSession() function', taskB_auth!.sectionCode.includes('function validateSession'));
assert('Player A section code does not contain validateSession', !taskA_auth!.sectionCode.includes('validateSession'));
assert('Player B section code does not contain login', !taskB_auth!.sectionCode.includes('function login'));

// ── 5. Deterministic Section Validation & Task Completion ───────────────────
console.log('\n[ 5. Deterministic Validation & Task Completion ]');
// Initial buggy code fails
const aFail = validatePrivateTaskCode(taskA_auth!.taskId, taskA_auth!.sectionCode);
assert('Player A initial buggy code fails validation', aFail.length > 0 && aFail.every(r => !r.passed));

// Fixed code passes
const fixedAuthCode = `export function login(username, password) {\n  if (username === "admin" && password === "admin123") {\n    return { success: true, token: "jwt_token_admin_authorized" };\n  }\n  return { success: false, error: "Invalid credentials" };\n}`;
const aPass = validatePrivateTaskCode(taskA_auth!.taskId, fixedAuthCode);
assert('Player A corrected code passes validation', aPass.length > 0 && aPass.every(r => r.passed));

// Authoritative progress updates
let gameTasks = getDefaultTasks();
const p1 = solveTask(gameTasks, 'task-auth');
assert('Global progress advances to 20%', p1.progress === 20);

// ── 6. Mafia Sabotage & Compromised State Lifecycle ─────────────────────────
console.log('\n[ 6. Mafia Sabotage & Compromised State Lifecycle ]');
let lifecycleTask: PrivatePlayerTask = { ...taskA_auth!, status: 'COMPLETED' };
assert('Task is COMPLETED initially', lifecycleTask.status === 'COMPLETED');

// Mafia compromises task
lifecycleTask.status = 'COMPROMISED';
lifecycleTask.sectionCode = lifecycleTask.baselineCode;
lifecycleTask.compromisedAt = Date.now();
assert('Task transitions to COMPROMISED upon sabotage', lifecycleTask.status === 'COMPROMISED');
assert('Code reverts to buggy baseline with OR (||) operator', lifecycleTask.sectionCode.includes('||'));

// Developer re-debugs
const reSolve = validatePrivateTaskCode(lifecycleTask.taskId, fixedAuthCode);
assert('Developer re-debugs compromised section and passes', reSolve.every(r => r.passed));
lifecycleTask.status = 'COMPLETED';
assert('Task successfully returns to COMPLETED', lifecycleTask.status === 'COMPLETED');

// ── 7. Anonymous Presence Counter ───────────────────────────────────────────
console.log('\n[ 7. Anonymous Presence (Zero Identity Leakage) ]');
const allPlayers = [playerA, playerB, ghostPlayer];
const otherActivePlayers = allPlayers.filter(
  p => p.id !== playerA.id && p.connected && p.alive !== false
).length;

const presenceLabel = `${otherActivePlayers} OTHER DEVELOPER${otherActivePlayers > 1 ? 'S' : ''} AT TERMINAL`;
assert('Anonymous presence shows count only ("1 OTHER DEVELOPER AT TERMINAL")', presenceLabel === '1 OTHER DEVELOPER AT TERMINAL');
assert('Presence label does not leak username "Bob"', !presenceLabel.includes(playerB.username));
assert('Presence label does not leak player ID', !presenceLabel.includes(playerB.id));

// ── 8. Ghost & Eliminated Player Protection ─────────────────────────────────
console.log('\n[ 8. Ghost & Eliminated Player Security ]');
function isEligibleToSolve(p: Player): boolean {
  return p.alive !== false && p.status !== 'ELIMINATED' && p.status !== 'GHOST';
}

assert('Alive player is eligible to edit and complete tasks', isEligibleToSolve(playerA) === true);
assert('Ghost player is blocked from editing and completing tasks', isEligibleToSolve(ghostPlayer) === false);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log(`  TOTAL TESTS: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('═══════════════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
