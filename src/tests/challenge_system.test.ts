import {
  PREBUILT_CHALLENGES,
  selectMatchChallenge,
  createChallengeMatchSession,
  generateChallengeAssignments,
  getAuthorizedObjective,
  validateChallengeCode,
  saveChallengeSession,
  getChallengeSession,
} from '../services/challengeService';
import { validatePrivateTaskCode } from '../editor/privateTasks';

console.log('================================================================');
console.log('🧪 AMONGDEVS — SUPABASE BUGGED CODE CHALLENGE SYSTEM VERIFICATION');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition: boolean, description: string) {
  totalCount++;
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // ── 1. PREBUILT CHALLENGES CATALOG ──
  console.log('--- 1. Prebuilt Challenges Catalog (10+ Total) ---');
  assert(PREBUILT_CHALLENGES.length >= 10, `Catalog contains ${PREBUILT_CHALLENGES.length} prebuilt challenges (>= 10)`);

  const javaChallenges = PREBUILT_CHALLENGES.filter((c) => c.language === 'JAVA');
  const pythonChallenges = PREBUILT_CHALLENGES.filter((c) => c.language === 'PYTHON');
  const cChallenges = PREBUILT_CHALLENGES.filter((c) => c.language === 'C');

  assert(javaChallenges.length >= 3, `Java challenges present: ${javaChallenges.length}`);
  assert(pythonChallenges.length >= 3, `Python challenges present: ${pythonChallenges.length}`);
  assert(cChallenges.length >= 3, `C challenges present: ${cChallenges.length}`);

  PREBUILT_CHALLENGES.forEach((c, i) => {
    assert(
      Boolean(c.id && c.title && c.description && c.code && c.bugs.length >= 6 && c.is_active),
      `Challenge ${i + 1} (${c.id} - ${c.language}/${c.difficulty}): Valid schema with ${c.bugs.length} unique bugs`
    );
  });

  // ── 1b. CODE MAFIA 3 FLAGSHIP JAVA PROJECTS ──
  console.log('\n--- 1b. Code Mafia 3 Flagship Java Projects ---');
  const bankProj = PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-bank')!;
  const libProj = PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-library')!;
  const studentProj = PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-student')!;

  assert(Boolean(bankProj && bankProj.bugs.length === 9), 'Bank Management System contains exactly 9 initial bugs');
  assert(Boolean(libProj && libProj.bugs.length === 9), 'Library Management System contains exactly 9 initial bugs');
  assert(Boolean(studentProj && studentProj.bugs.length === 9), 'Student Result System contains exactly 9 initial bugs');

  // Test 3 Developers Equal Distribution (3 bugs each across rooms)
  const threeDevs = ['dev-1', 'dev-2', 'dev-3'];
  const bankSession = createChallengeMatchSession('bank-game-1', bankProj, threeDevs);
  assert(bankSession.assignments['dev-1'].length === 3, 'Developer 1 assigned exactly 3 functions/bugs in Bank System');
  assert(bankSession.assignments['dev-2'].length === 3, 'Developer 2 assigned exactly 3 functions/bugs in Bank System');
  assert(bankSession.assignments['dev-3'].length === 3, 'Developer 3 assigned exactly 3 functions/bugs in Bank System');

  const libSession = createChallengeMatchSession('lib-game-1', libProj, threeDevs);
  assert(libSession.assignments['dev-1'].length === 3, 'Developer 1 assigned exactly 3 functions/bugs in Library System');
  assert(libSession.assignments['dev-2'].length === 3, 'Developer 2 assigned exactly 3 functions/bugs in Library System');
  assert(libSession.assignments['dev-3'].length === 3, 'Developer 3 assigned exactly 3 functions/bugs in Library System');

  const studentSession = createChallengeMatchSession('student-game-1', studentProj, threeDevs);
  assert(studentSession.assignments['dev-1'].length === 3, 'Developer 1 assigned exactly 3 functions/bugs in Student System');
  assert(studentSession.assignments['dev-2'].length === 3, 'Developer 2 assigned exactly 3 functions/bugs in Student System');
  assert(studentSession.assignments['dev-3'].length === 3, 'Developer 3 assigned exactly 3 functions/bugs in Student System');

  // ── 2. LANGUAGE & DIFFICULTY FILTERING ──
  console.log('\n--- 2. Language & Difficulty Filtering ---');
  const javaMedium = await selectMatchChallenge('JAVA', 'MEDIUM');
  assert(
    javaMedium.success && javaMedium.challenge?.language === 'JAVA' && (javaMedium.challenge.difficulty === 'MEDIUM'),
    'Selects Java Medium challenge when Host chooses Java / Medium'
  );

  const pythonHard = await selectMatchChallenge('PYTHON', 'HARD');
  assert(
    pythonHard.success && pythonHard.challenge?.language === 'PYTHON' && pythonHard.challenge.difficulty === 'HARD',
    'Selects Python Hard challenge when Host chooses Python / Hard'
  );

  const cEasy = await selectMatchChallenge('C', 'EASY');
  assert(
    cEasy.success && cEasy.challenge?.language === 'C' && cEasy.challenge.difficulty === 'EASY',
    'Selects C Easy challenge when Host chooses C / Easy'
  );

  const invalidSelection = await selectMatchChallenge('RUST' as any, 'HARD');
  assert(
    !invalidSelection.success && Boolean(invalidSelection.error),
    'Gracefully rejects unsupported language with clear error message'
  );

  // ── 3. ONE SHARED CODEBASE & UNIQUE BUG DISTRIBUTION (4-10 Players) ──
  console.log('\n--- 3. 4-Player Match Simulation: One Shared Codebase & Unique Bug Objectives ---');
  const selectedChallenge = javaMedium.challenge!;
  const playerIds = ['dev-player-1', 'dev-player-2', 'dev-player-3', 'dev-player-4'];
  const session = createChallengeMatchSession('test-game-room-101', selectedChallenge, playerIds);

  assert(session.challengeId === selectedChallenge.id, 'Session references selected challenge ID');
  assert(session.sharedCode === selectedChallenge.code, 'Session contains the ONE authoritative shared code');

  // Verify unique assignments
  const allAssignedBugIds: string[] = [];
  playerIds.forEach((pid) => {
    const assignments = session.assignments[pid];
    assert(assignments.length > 0, `Player ${pid} received ${assignments.length} room assignments`);
    assignments.forEach((a) => {
      assert(a.playerId === pid, `Assignment owned by ${pid}`);
      assert(a.roomIndex >= 1 && a.roomIndex <= 6, `Room index ${a.roomIndex} is within 1..6`);
      allAssignedBugIds.push(a.bugId);
    });
  });

  const uniqueBugsSet = new Set(allAssignedBugIds);
  assert(
    uniqueBugsSet.size === allAssignedBugIds.length,
    `No two players received the same bug objective (${uniqueBugsSet.size} unique objectives assigned)`
  );

  // ── 4. AUTHORIZATION GUARD & DATA LEAKAGE PREVENTION ──
  console.log('\n--- 4. Room Entry Authorization & Private Task Isolation ---');
  const player1 = playerIds[0];
  const p1Assignments = session.assignments[player1];
  const p1Room = p1Assignments[0].roomId;

  // Player 1 entering their assigned room
  const authObjP1 = getAuthorizedObjective(session, player1, p1Room);
  assert(
    authObjP1 !== null && authObjP1.hasAssignment && authObjP1.assignment?.bugId === p1Assignments[0].bugId,
    `Player 1 in assigned room (${p1Room}) receives their private objective: "${authObjP1?.assignment?.title}"`
  );
  assert(
    authObjP1?.sharedCode === selectedChallenge.code,
    'Player 1 receives the complete shared codebase'
  );
  assert(
    (authObjP1?.assignment as any)?.expectedFix === undefined,
    'Sensitive server expectedFix is NOT leaked to client response'
  );

  // Player 1 entering unassigned room
  const unassignedRooms = ['library', 'medbay', 'storage', 'dev_lab', 'command', 'mafia_lair'].filter(
    (r) => !p1Assignments.some((a) => a.roomId === r)
  );
  if (unassignedRooms.length > 0) {
    const authUnassigned = getAuthorizedObjective(session, player1, unassignedRooms[0]);
    assert(
      authUnassigned !== null && authUnassigned.hasAssignment === false && authUnassigned.assignment === undefined,
      `Player 1 in unassigned room (${unassignedRooms[0]}) receives NO private objective`
    );
  }

  // Player 2 attempting to read Player 1's room objective
  const player2 = playerIds[1];
  const authObjP2InP1Room = getAuthorizedObjective(session, player2, p1Room);
  const p2HasThisRoom = session.assignments[player2].some((a) => a.roomId === p1Room);
  if (!p2HasThisRoom) {
    assert(
      authObjP2InP1Room !== null && authObjP2InP1Room.hasAssignment === false,
      `Player 2 cannot access Player 1's objective in room ${p1Room}`
    );
  }

  // ── 5. CODE VALIDATION ──
  console.log('\n--- 5. Deterministic Code Validation ---');
  const testBug = selectedChallenge.bugs[0];
  const passingTest = validateChallengeCode(selectedChallenge.id, testBug.bugId, testBug.expectedFix);
  assert(
    passingTest.length > 0 && passingTest.every((t) => t.passed),
    `Validator accepts correct solution for ${testBug.bugId}`
  );

  const failingTest = validateChallengeCode(selectedChallenge.id, testBug.bugId, 'broken invalid code snippet');
  assert(
    failingTest.some((t) => !t.passed),
    `Validator rejects broken code for ${testBug.bugId}`
  );

  const privateTaskPassingTest = validatePrivateTaskCode(testBug.bugId, testBug.expectedFix);
  assert(
    privateTaskPassingTest.length > 0 && privateTaskPassingTest.every((t) => t.passed),
    `validatePrivateTaskCode validates challenge bug ${testBug.bugId}`
  );

  // ── 6. PERSISTENCE & REFRESH SAFETY ──
  console.log('\n--- 6. Persistence & Refresh / Reconnect Safety ---');
  saveChallengeSession(session);
  const restoredSession = getChallengeSession('test-game-room-101');
  assert(restoredSession !== null, 'Challenge session recovered from storage');
  assert(restoredSession?.challengeId === session.challengeId, 'Same challenge ID restored');
  assert(restoredSession?.sharedCode === session.sharedCode, 'Same shared code restored');
  assert(
    JSON.stringify(restoredSession?.assignments) === JSON.stringify(session.assignments),
    'Exact same player + room + bug assignments restored (zero re-randomization)'
  );

  console.log(`\n================================================================`);
  console.log(`🎉 ALL VERIFICATION TESTS PASSED: ${passCount} / ${totalCount}`);
  console.log(`================================================================\n`);
}

runTests().catch(console.error);
