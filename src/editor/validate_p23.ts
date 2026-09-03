/**
 * P2.3 Validation Script
 * Tests: roomMapping + RoomEditorModal integration behaviour.
 * Run via: npx tsx src/editor/validate_p23.ts
 */

import {
  getRoomMapping, getFileIdForRoom, getTaskIdForRoom, isCodingRoom
} from './roomMapping';
import { getInitialProjectFiles } from './predefinedProject';
import { runTaskTests } from './testRunner';

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

console.log('\n══════════════════════════════════════════════════════');
console.log('  P2.3 Room Mapping Validation');
console.log('══════════════════════════════════════════════════════\n');

// ── TEST 1-5: Room ID lookups (MapData.id form) ─────────────────────────────
console.log('[ Room ID lookups (MapData.id) ]');
assert('auth_lab → file-auth',     getFileIdForRoom('auth_lab')      === 'file-auth');
assert('database_room → file-database', getFileIdForRoom('database_room') === 'file-database');
assert('utilities_lab → file-utils',    getFileIdForRoom('utilities_lab')  === 'file-utils');
assert('payment_lab → file-payment',    getFileIdForRoom('payment_lab')    === 'file-payment');
assert('mainframe → file-app',          getFileIdForRoom('mainframe')      === 'file-app');

// ── TEST 6-10: Display name lookups (RoomZones.ts currently returns name) ───
console.log('\n[ Room display name lookups (RoomZones name form) ]');
assert('"AUTH LAB" → file-auth',        getFileIdForRoom('AUTH LAB')      === 'file-auth');
assert('"DATABASE ROOM" → file-database', getFileIdForRoom('DATABASE ROOM') === 'file-database');
assert('"UTILITIES LAB" → file-utils',  getFileIdForRoom('UTILITIES LAB') === 'file-utils');
assert('"PAYMENT LAB" → file-payment',  getFileIdForRoom('PAYMENT LAB')   === 'file-payment');
assert('"MAINFRAME" → file-app',        getFileIdForRoom('MAINFRAME')      === 'file-app');

// ── TEST 11-13: Unknown / non-coding rooms ───────────────────────────────────
console.log('\n[ Unknown / non-coding room guards ]');
assert('unknown room → null',            getFileIdForRoom('unknown_room')       === null);
assert('CENTRAL HUB → null',            getFileIdForRoom('CENTRAL HUB')        === null);
assert('EMERGENCY_TERMINAL → null',     getFileIdForRoom('EMERGENCY_TERMINAL') === null);
assert('isCodingRoom(auth_lab) = true', isCodingRoom('auth_lab') === true);
assert('isCodingRoom(CENTRAL HUB) = false', isCodingRoom('CENTRAL HUB') === false);

// ── TEST 14-15: Task ID lookup ───────────────────────────────────────────────
console.log('\n[ Task ID lookups ]');
assert('auth_lab → task-auth',     getTaskIdForRoom('auth_lab')      === 'task-auth');
assert('mainframe → task-app',     getTaskIdForRoom('mainframe')     === 'task-app');
assert('unknown room taskId → null', getTaskIdForRoom('unknown')     === null);

// ── TEST 16-17: getRoomMapping returns roomLabel ─────────────────────────────
console.log('\n[ getRoomMapping roomLabel ]');
assert('auth_lab roomLabel = AUTH LAB',
  getRoomMapping('auth_lab')?.roomLabel === 'AUTH LAB');
assert('"DATABASE ROOM" roomLabel = DATABASE ROOM',
  getRoomMapping('DATABASE ROOM')?.roomLabel === 'DATABASE ROOM');

// ── TEST 18-19: Predefined project compatibility ─────────────────────────────
console.log('\n[ Predefined project file resolution ]');
const files = getInitialProjectFiles();
const authFileId = getFileIdForRoom('auth_lab')!;
const authFile = files.find(f => f.id === authFileId);
assert('auth_lab resolves to a real EditorFile', authFile !== undefined);
assert('auth.js content contains login function', authFile?.content.includes('function login') ?? false);

// ── TEST 20-21: testRunner integration — buggy code fails ───────────────────
console.log('\n[ TestRunner integration — buggy baseline ]');
const buggFiles = getInitialProjectFiles();
const authTaskId = getTaskIdForRoom('auth_lab')!;
const bugResults = runTaskTests(buggFiles, authTaskId);
assert('buggy auth.js produces ≥1 test result', bugResults.length > 0);
assert('buggy auth.js test FAILS', bugResults.every(r => !r.passed));

// ── TEST 22-23: testRunner integration — fixed code passes ──────────────────
console.log('\n[ TestRunner integration — fixed code passes ]');
const fixedFiles = getInitialProjectFiles().map(f => {
  if (f.id === 'file-auth') {
    return {
      ...f,
      content: f.content.replace(
        'username === "admin" || password === "admin123"',
        'username === "admin" && password === "admin123"'
      )
    };
  }
  return f;
});
const fixedResults = runTaskTests(fixedFiles, authTaskId);
assert('fixed auth.js produces ≥1 test result', fixedResults.length > 0);
assert('fixed auth.js test PASSES', fixedResults.every(r => r.passed));

// ── TEST 24: unknown taskId safe return ─────────────────────────────────────
console.log('\n[ Unknown task safety ]');
const unknownResults = runTaskTests(files, 'task-unknown-xyz');
assert('unknown task returns 1 failure result', unknownResults.length === 1 && !unknownResults[0].passed);

// ── P2.2 regression: all 5 validator quick-smoke ────────────────────────────
console.log('\n[ P2.2 regression — all 5 validators present in TASK_VALIDATORS ]');
import { TASK_VALIDATORS } from './testRunner';
['task-auth','task-utils','task-database','task-payment','task-app'].forEach(id => {
  assert(`TASK_VALIDATORS has ${id}`, id in TASK_VALIDATORS);
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(`  TOTAL: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
