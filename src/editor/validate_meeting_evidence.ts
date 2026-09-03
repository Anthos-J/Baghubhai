/**
 * validate_meeting_evidence.ts — Meeting → Evidence Integration Validation
 *
 * Tests:
 * 1. Evidence calculation availability during Emergency Meetings.
 * 2. Unchanged baseline handling (clean message, no crash).
 * 3. Changed file detection & line diff stats (added/removed).
 * 4. Read-only safety (pure diff calculations, zero state mutations).
 * 5. Unknown/missing file safety.
 * 6. Empty project safety.
 *
 * Run with: npx tsx src/editor/validate_meeting_evidence.ts
 */

import { getFileDiff, getAllFilesEvidence, getChangedFilesEvidence } from './evidence';
import { INITIAL_PROJECT_FILES, getInitialProjectFiles } from './predefinedProject';

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
console.log('  MEETING → EVIDENCE INTEGRATION VALIDATION');
console.log('══════════════════════════════════════════════════════════════\n');

// ── TEST 1: Unchanged Baseline State During Meeting ────────────────────────
console.log('[ 1. Unchanged Baseline Meeting Evidence ]');
const cleanFiles = getInitialProjectFiles();
const cleanEvidence = getAllFilesEvidence(cleanFiles);
assert('Returns evidence for all 5 baseline project files', cleanEvidence.length === 5);
assert('All 5 files report changed === false when untouched', cleanEvidence.every(e => !e.changed));

const changedClean = getChangedFilesEvidence(cleanFiles);
assert('getChangedFilesEvidence returns 0 items for untouched project', changedClean.length === 0);

// ── TEST 2: Suspicious Code Mutation Detection ──────────────────────────────
console.log('\n[ 2. Suspicious Sabotage / Code Mutation Detection ]');
const sabotagedFiles = getInitialProjectFiles();
// Simulate Imposter or Developer modifying auth.js and database.js
sabotagedFiles[0].content = `// SABOTAGED AUTH\nexport function login() { return true; }`;
sabotagedFiles[2].content = `// SABOTAGED DB\nexport function connectDatabase() { return "CONNECTED"; }`;

const sabotagedEvidence = getAllFilesEvidence(sabotagedFiles);
assert('getAllFilesEvidence processes modified project correctly', sabotagedEvidence.length === 5);

const detectedSuspects = getChangedFilesEvidence(sabotagedFiles);
assert('Identifies exactly 2 modified files', detectedSuspects.length === 2);
assert('file-auth is flagged as MODIFIED', detectedSuspects.some(e => e.fileId === 'file-auth' && e.changed));
assert('file-database is flagged as MODIFIED', detectedSuspects.some(e => e.fileId === 'file-database' && e.changed));

const authDiff = getFileDiff('file-auth', sabotagedFiles[0].content)!;
assert('Added lines count > 0 for modified auth.js', authDiff.addedLinesCount > 0);
assert('Removed lines count > 0 for modified auth.js', authDiff.removedLinesCount > 0);
assert('Baseline content matches INITIAL_PROJECT_FILES', authDiff.baselineContent === INITIAL_PROJECT_FILES[0].content);

// ── TEST 3: Read-Only Safety & Non-Mutation ────────────────────────────────
console.log('\n[ 3. Read-Only Safety & Non-Mutation Verification ]');
const snapshotBefore = JSON.stringify(INITIAL_PROJECT_FILES);
// Run multiple evidence inspections
for (let i = 0; i < 5; i++) {
  getFileDiff('file-auth', 'mutated content ' + i);
  getAllFilesEvidence(sabotagedFiles);
}
const snapshotAfter = JSON.stringify(INITIAL_PROJECT_FILES);
assert('Evidence inspection causes ZERO mutations to INITIAL_PROJECT_FILES', snapshotBefore === snapshotAfter);

// ── TEST 4: Missing / Unknown / Edge Case Safety ───────────────────────────
console.log('\n[ 4. Edge Cases & Safety Guards ]');
const unknownResult = getFileDiff('unknown-file-id', 'some code');
assert('Unknown file ID returns null safely without throwing', unknownResult === null);

const emptyFiles = getAllFilesEvidence([]);
assert('Empty files array defaults safely to baseline comparisons', emptyFiles.length === 5);
assert('Empty files array marks all baseline as changed: false', emptyFiles.every(e => !e.changed));

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  TOTAL MEETING EVIDENCE TESTS: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
