/**
 * validate_p24.ts — P2.4 Evidence & Diff System Validation
 *
 * Tests:
 * 1. Unchanged files (baseline == current) -> changed === false
 * 2. Changed files (single line modification) -> changed === true
 * 3. Multiple modifications -> changed === true
 * 4. Unknown file ID -> safely returns null
 * 5. Empty current content handling -> safely handles without crash
 * 6. All 5 predefined project files verified
 * 7. getAllFilesEvidence & getChangedFilesEvidence helpers
 * 8. P2.2 regression (TASK_VALIDATORS & runTaskTests)
 * 9. P2.3 regression (getRoomMapping & getFileIdForRoom)
 *
 * Run with: npx tsx src/editor/validate_p24.ts
 */

import { getFileDiff, getAllFilesEvidence, getChangedFilesEvidence } from './evidence';
import { INITIAL_PROJECT_FILES, getInitialProjectFiles } from './predefinedProject';
import { runTaskTests, TASK_VALIDATORS } from './testRunner';
import { getFileIdForRoom, isCodingRoom, getRoomMapping } from './roomMapping';

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
console.log('  P2.4 Evidence & Diff System Validation');
console.log('══════════════════════════════════════════════════════\n');

// ── TEST 1: Unchanged file ───────────────────────────────────────────────────
console.log('[ 1. Unchanged File Verification ]');
const authBaseline = INITIAL_PROJECT_FILES.find(f => f.id === 'file-auth')!;
const diffUnchanged = getFileDiff('file-auth', authBaseline.content);
assert('Returns evidence object', diffUnchanged !== null);
assert('changed === false', diffUnchanged?.changed === false);
assert('addedLinesCount === 0', diffUnchanged?.addedLinesCount === 0);
assert('removedLinesCount === 0', diffUnchanged?.removedLinesCount === 0);
assert('baselineContent matches currentContent', diffUnchanged?.baselineContent === diffUnchanged?.currentContent);

// ── TEST 2: Single line change ───────────────────────────────────────────────
console.log('\n[ 2. Single Line Modification ]');
const modifiedAuth = authBaseline.content.replace(
  'username === "admin" || password === "admin123"',
  'username === "admin" && password === "admin123"'
);
const diffSingleChange = getFileDiff('file-auth', modifiedAuth);
assert('Returns evidence object', diffSingleChange !== null);
assert('changed === true', diffSingleChange?.changed === true);
assert('addedLinesCount > 0', (diffSingleChange?.addedLinesCount ?? 0) > 0);
assert('removedLinesCount > 0', (diffSingleChange?.removedLinesCount ?? 0) > 0);
assert('fileName is auth.js', diffSingleChange?.fileName === 'auth.js');
assert('taskId is task-auth', diffSingleChange?.taskId === 'task-auth');

// ── TEST 3: Multiple changes across file ────────────────────────────────────
console.log('\n[ 3. Multiple Line Changes ]');
const multiChanged = `// MODIFIED FILE HEADER\n` + modifiedAuth + `\n// EXTRA LOGGING\nconsole.log("session ok");`;
const diffMulti = getFileDiff('file-auth', multiChanged);
assert('Returns evidence for multi changes', diffMulti !== null);
assert('changed === true', diffMulti?.changed === true);
assert('addedLinesCount >= 2', (diffMulti?.addedLinesCount ?? 0) >= 2);

// ── TEST 4: Unknown file ID handling ─────────────────────────────────────────
console.log('\n[ 4. Unknown File ID Safety ]');
const unknownDiff = getFileDiff('file-nonexistent-99', 'console.log("test");');
assert('Unknown file ID safely returns null', unknownDiff === null);

// ── TEST 5: Empty / undefined current content handling ───────────────────────
console.log('\n[ 5. Empty / Undefined Content Safety ]');
const emptyDiff = getFileDiff('file-auth', '');
assert('Empty string current content handled safely', emptyDiff !== null);
assert('Empty content marked as changed === true', emptyDiff?.changed === true);
assert('Empty content has currentContent === ""', emptyDiff?.currentContent === '');

const defaultDiff = getFileDiff('file-auth', undefined);
assert('Undefined currentContent defaults to baseline', defaultDiff !== null);
assert('Undefined content marked as changed === false', defaultDiff?.changed === false);

// ── TEST 6: All 5 Predefined Project Files ───────────────────────────────────
console.log('\n[ 6. All 5 Baseline Files ]');
const expectedIds = ['file-auth', 'file-utils', 'file-database', 'file-payment', 'file-app'];
for (const fileId of expectedIds) {
  const file = INITIAL_PROJECT_FILES.find(f => f.id === fileId);
  assert(`Baseline contains ${fileId}`, file !== undefined);
  const diff = getFileDiff(fileId, file?.content);
  assert(`${fileId} diff resolves correctly`, diff !== null && diff.fileName === file?.name);
}

// ── TEST 7: getAllFilesEvidence & getChangedFilesEvidence ───────────────────
console.log('\n[ 7. Bulk Evidence Helpers ]');
const currentFiles = getInitialProjectFiles();
// Modify 2 files: auth.js and database.js
currentFiles[0].content = '// MODIFIED AUTH\n' + currentFiles[0].content;
currentFiles[2].content = '// MODIFIED DATABASE\n' + currentFiles[2].content;

const allEvidence = getAllFilesEvidence(currentFiles);
assert('getAllFilesEvidence returns all 5 files', allEvidence.length === 5);

const changedEvidence = getChangedFilesEvidence(currentFiles);
assert('getChangedFilesEvidence returns exactly 2 changed files', changedEvidence.length === 2);
assert('Changed files include file-auth', changedEvidence.some(e => e.fileId === 'file-auth'));
assert('Changed files include file-database', changedEvidence.some(e => e.fileId === 'file-database'));
assert('Unchanged file-utils is not in changed list', !changedEvidence.some(e => e.fileId === 'file-utils'));

// ── TEST 8: P2.2 Regression ──────────────────────────────────────────────────
console.log('\n[ 8. P2.2 Regression Checks ]');
['task-auth', 'task-utils', 'task-database', 'task-payment', 'task-app'].forEach(taskId => {
  assert(`TASK_VALIDATORS includes ${taskId}`, taskId in TASK_VALIDATORS);
});
const initialResults = runTaskTests(getInitialProjectFiles(), 'task-auth');
assert('Initial bugged auth.js fails tests', initialResults.length > 0 && !initialResults[0].passed);

// ── TEST 9: P2.3 Regression ──────────────────────────────────────────────────
console.log('\n[ 9. P2.3 Regression Checks ]');
assert('auth_lab maps to file-auth', getFileIdForRoom('auth_lab') === 'file-auth');
assert('AUTH LAB maps to file-auth', getFileIdForRoom('AUTH LAB') === 'file-auth');
assert('getRoomMapping(auth_lab) has roomLabel', getRoomMapping('auth_lab')?.roomLabel === 'AUTH LAB');
assert('database_room maps to file-database', getFileIdForRoom('database_room') === 'file-database');
assert('mainframe maps to file-app', getFileIdForRoom('mainframe') === 'file-app');
assert('isCodingRoom(auth_lab) === true', isCodingRoom('auth_lab') === true);
assert('isCodingRoom(CENTRAL HUB) === false', isCodingRoom('CENTRAL HUB') === false);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(`  TOTAL: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
