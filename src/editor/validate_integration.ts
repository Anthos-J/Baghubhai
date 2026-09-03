/**
 * validate_integration.ts — Room-to-Editor Gameplay Integration Validation
 *
 * Simulates:
 * 1. Player entering each of the 5 coding rooms and triggering terminal access.
 * 2. Room -> File resolution for all 5 rooms.
 * 3. Editing and deterministic test execution for each room.
 * 4. Non-coding room safety (CENTRAL HUB, EMERGENCY_TERMINAL, unknown).
 * 5. P2.2, P2.3, P2.4 regression suites.
 *
 * Run with: npx tsx src/editor/validate_integration.ts
 */

import { getRoomMapping, isCodingRoom } from './roomMapping';
import { getInitialProjectFiles } from './predefinedProject';
import { isTaskPassed } from './testRunner';
import { getFileDiff, getAllFilesEvidence } from './evidence';

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
console.log('  AMONGDEVS: P2 / P1 ROOM → EDITOR INTEGRATION VALIDATION');
console.log('══════════════════════════════════════════════════════════════\n');

// ── 1. AUTH LAB FLOW ────────────────────────────────────────────────────────
console.log('[ 1. AUTH LAB Flow ]');
const authRoom = 'AUTH LAB';
assert('AUTH LAB is recognized as coding room', isCodingRoom(authRoom) === true);
const authMapping = getRoomMapping(authRoom)!;
assert('AUTH LAB maps to file-auth (auth.js)', authMapping.fileId === 'file-auth');
assert('AUTH LAB task ID is task-auth', authMapping.taskId === 'task-auth');

const authFiles = getInitialProjectFiles();
assert('Initial auth.js fails tests', !isTaskPassed(authFiles, authMapping.taskId));

// Fix bug in auth.js
authFiles[0].content = authFiles[0].content.replace(
  'username === "admin" || password === "admin123"',
  'username === "admin" && password === "admin123"'
);
assert('Fixed auth.js passes deterministic test', isTaskPassed(authFiles, authMapping.taskId));
const authDiff = getFileDiff(authMapping.fileId, authFiles[0].content);
assert('auth.js diff detected as modified', authDiff?.changed === true);

// ── 2. DATABASE ROOM FLOW ───────────────────────────────────────────────────
console.log('\n[ 2. DATABASE ROOM Flow ]');
const dbRoom = 'DATABASE ROOM';
assert('DATABASE ROOM is recognized as coding room', isCodingRoom(dbRoom) === true);
const dbMapping = getRoomMapping(dbRoom)!;
assert('DATABASE ROOM maps to file-database (database.js)', dbMapping.fileId === 'file-database');
assert('DATABASE ROOM task ID is task-database', dbMapping.taskId === 'task-database');

const dbFiles = getInitialProjectFiles();
assert('Initial database.js fails tests', !isTaskPassed(dbFiles, dbMapping.taskId));
// Fix database.js (return true instead of false)
dbFiles[2].content = dbFiles[2].content.replace('return false;', 'return true;');
assert('Fixed database.js passes deterministic test', isTaskPassed(dbFiles, dbMapping.taskId));

// ── 3. UTILITIES LAB FLOW ───────────────────────────────────────────────────
console.log('\n[ 3. UTILITIES LAB Flow ]');
const utilRoom = 'UTILITIES LAB';
assert('UTILITIES LAB is recognized as coding room', isCodingRoom(utilRoom) === true);
const utilMapping = getRoomMapping(utilRoom)!;
assert('UTILITIES LAB maps to file-utils (utils.js)', utilMapping.fileId === 'file-utils');
assert('UTILITIES LAB task ID is task-utils', utilMapping.taskId === 'task-utils');

const utilFiles = getInitialProjectFiles();
assert('Initial utils.js fails tests', !isTaskPassed(utilFiles, utilMapping.taskId));
// Fix utils.js (a - b instead of b - a)
utilFiles[1].content = utilFiles[1].content.replace('(a, b) => b - a', '(a, b) => a - b');
assert('Fixed utils.js passes deterministic test', isTaskPassed(utilFiles, utilMapping.taskId));

// ── 4. PAYMENT LAB FLOW ─────────────────────────────────────────────────────
console.log('\n[ 4. PAYMENT LAB Flow ]');
const paymentRoom = 'PAYMENT LAB';
assert('PAYMENT LAB is recognized as coding room', isCodingRoom(paymentRoom) === true);
const paymentMapping = getRoomMapping(paymentRoom)!;
assert('PAYMENT LAB maps to file-payment (payment.js)', paymentMapping.fileId === 'file-payment');
assert('PAYMENT LAB task ID is task-payment', paymentMapping.taskId === 'task-payment');

const paymentFiles = getInitialProjectFiles();
assert('Initial payment.js fails tests', !isTaskPassed(paymentFiles, paymentMapping.taskId));
// Fix payment.js (amount > 0 instead of amount >= 0)
paymentFiles[3].content = paymentFiles[3].content.replace('amount >= 0', 'amount > 0');
assert('Fixed payment.js passes deterministic test', isTaskPassed(paymentFiles, paymentMapping.taskId));

// ── 5. MAINFRAME FLOW ───────────────────────────────────────────────────────
console.log('\n[ 5. MAINFRAME Flow ]');
const mainframeRoom = 'MAINFRAME';
assert('MAINFRAME is recognized as coding room', isCodingRoom(mainframeRoom) === true);
const mainframeMapping = getRoomMapping(mainframeRoom)!;
assert('MAINFRAME maps to file-app (app.js)', mainframeMapping.fileId === 'file-app');
assert('MAINFRAME task ID is task-app', mainframeMapping.taskId === 'task-app');

const appFiles = getInitialProjectFiles();
assert('Initial app.js fails tests', !isTaskPassed(appFiles, mainframeMapping.taskId));
// Fix app.js (isProd ? true : false)
appFiles[4].content = appFiles[4].content.replace('ready: isProd ? false : true', 'ready: isProd ? true : false');
assert('Fixed app.js passes deterministic test', isTaskPassed(appFiles, mainframeMapping.taskId));

// ── 6. NON-CODING ROOMS & SAFETY ───────────────────────────────────────────
console.log('\n[ 6. Non-Coding Zone Safety Checks ]');
assert('CENTRAL HUB is NOT a coding room', isCodingRoom('CENTRAL HUB') === false);
assert('EMERGENCY_TERMINAL is NOT a coding room', isCodingRoom('EMERGENCY_TERMINAL') === false);
assert('central_hub id is NOT a coding room', isCodingRoom('central_hub') === false);
assert('emergency_terminal id is NOT a coding room', isCodingRoom('emergency_terminal') === false);
assert('Unknown room "HALLWAY" is NOT a coding room', isCodingRoom('HALLWAY') === false);
assert('null room is NOT a coding room', isCodingRoom(null as any) === false);
assert('undefined room is NOT a coding room', isCodingRoom(undefined as any) === false);

// ── 7. BULK EVIDENCE VERIFICATION ───────────────────────────────────────────
console.log('\n[ 7. Bulk Evidence Integration ]');
const modifiedProject = getInitialProjectFiles();
modifiedProject[0].content = authFiles[0].content; // auth fixed
modifiedProject[1].content = utilFiles[1].content; // utils fixed
const evidenceList = getAllFilesEvidence(modifiedProject);
assert('All 5 files return evidence', evidenceList.length === 5);
const altered = evidenceList.filter(e => e.changed);
assert('Exactly 2 modified files detected', altered.length === 2);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  TOTAL INTEGRATION TESTS: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
