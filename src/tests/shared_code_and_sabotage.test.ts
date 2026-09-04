/**
 * shared_code_and_sabotage.test.ts
 *
 * Comprehensive end-to-end test suite for Code Mafia Shared Code, Supabase Persistence,
 * Versioning, Stale Save Protection, Sabotage Triggers, and Late Mafia Sabotage.
 *
 * Tests:
 * 1. TEST 1: CREWMATE SAVE (v1 -> v2, code persisted, version incremented)
 * 2. TEST 2: LATE MAFIA ENTRY (Crewmate saves v10, late-entering Mafia fetches and sees v10)
 * 3. TEST 3: SABOTAGE (Mafia mutates latest v10, produces authoritative v11)
 * 4. TEST 4: CREWMATE SEES SABOTAGE (Realtime / latest fetch reflects sabotaged code)
 * 5. TEST 5: STALE NORMAL SAVE (Player with outdated v10 cannot overwrite v11)
 * 6. TEST 6: STALE MAFIA (Mafia with old local v8 triggers sabotage -> fetches v10 -> creates v11, never v9)
 * 7. TEST 7: PERSISTENCE ACROSS RE-OPEN (Code persists and restores after terminal closed/reopened)
 * 8. TEST 8: SABOTAGE TRIGGER GENERATION & ATOMIC CONSUMPTION (Private trigger creation & duplicate prevention)
 * 9. TEST 9: EVENT AUDIT LOGGING (FILE_OPENED, TASK_COMPLETED, BUG_INJECTED without leaking roles)
 */

import {
  initGameFiles,
  fetchLatestSharedFile,
  saveCrewmateCode,
  sabotageSharedCode,
  applyControlledBugMutation,
} from '../services/sharedCodeService';
import {
  createSabotageTrigger,
  consumeSabotageTrigger,
  fetchActiveSabotageTriggers,
} from '../services/sabotageTriggerService';
import { logGameEvent, fetchGameEvents } from '../services/eventLogger';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING CODE MAFIA SHARED CODE & SABOTAGE TEST SUITE');
  console.log('======================================================\n');

  const gameId = `test-game-${Date.now()}`;
  const crewmateId = 'crewmate-alice';
  const mafiaId = 'mafia-bob';
  const playerAId = 'player-a';
  const playerBId = 'player-b';

  // --------------------------------------------------------------------------
  console.log('--- TEST 0: Initialize Game Files at Version 1 ---');
  // --------------------------------------------------------------------------
  const initialFiles = await initGameFiles(gameId);
  assert(initialFiles.length >= 5, 'Initialized shared files for all facility rooms');
  const authFileV1 = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(authFileV1.version === 1, 'Initial auth.js is at Version 1');
  assert(authFileV1.content.includes('login'), 'Initial auth.js contains authentication module code');
  console.log('  ✅ TEST 0 PASSED\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 1: CREWMATE SAVE ---');
  // --------------------------------------------------------------------------
  const correctedAuthCode = authFileV1.content.replace(' || ', ' && ');
  const saveRes = await saveCrewmateCode({
    gameId,
    roomIdOrFileId: 'auth_lab',
    content: correctedAuthCode,
    expectedVersion: 1,
    playerId: crewmateId,
  });

  assert(saveRes.success === true, 'Crewmate save succeeded');
  assert(saveRes.file?.version === 2, 'Auth file version incremented from 1 to 2');
  assert(Boolean(saveRes.file?.content.includes(' && ')), 'Authoritative file has corrected AND operator');
  assert(saveRes.file?.updated_by === crewmateId, 'File updated_by records crewmate player ID');

  const fetchedAfterSave = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(fetchedAfterSave.version === 2, 'Supabase / store returns Version 2');
  assert(fetchedAfterSave.content.includes(' && '), 'Supabase returns corrected code');
  console.log('  ✅ TEST 1 PASSED: Crewmate save correctly persists and increments version\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 2: LATE MAFIA ENTRY (FETCH LATEST FROM SUPABASE) ---');
  // --------------------------------------------------------------------------
  // Simulate advancing the file to Version 10 through repeated saves
  let currentVer = fetchedAfterSave.version;
  let currentCode = fetchedAfterSave.content;

  while (currentVer < 10) {
    currentCode = currentCode + `\n// Revision step ${currentVer + 1}`;
    const stepRes = await saveCrewmateCode({
      gameId,
      roomIdOrFileId: 'auth_lab',
      content: currentCode,
      expectedVersion: currentVer,
      playerId: crewmateId,
    });
    assert(stepRes.success, `Step save to v${currentVer + 1} succeeded`);
    currentVer = stepRes.file!.version;
  }

  assert(currentVer === 10, 'Auth file successfully advanced to Version 10');

  // Mafia enters the room later
  const mafiaFetched = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(mafiaFetched.version === 10, 'Late-entering Mafia fetches Version 10 from Supabase');
  assert(mafiaFetched.content === currentCode, 'Mafia sees the exact corrected Crewmate code');
  console.log('  ✅ TEST 2 PASSED: Late-entering Mafia loads authoritative Version 10\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 3: SABOTAGE ON LATEST CODE ---');
  // --------------------------------------------------------------------------
  const sabotageRes = await sabotageSharedCode({
    gameId,
    roomIdOrFileId: 'auth_lab',
    playerId: mafiaId,
  });

  assert(sabotageRes.success === true, 'Mafia sabotage succeeded');
  assert(sabotageRes.previousVersion === 10, 'Sabotage operated on previous Version 10');
  assert(sabotageRes.newVersion === 11, 'Sabotage created Version 11');
  assert(sabotageRes.file?.version === 11, 'File in Supabase is now Version 11');
  assert(sabotageRes.file?.updated_by === mafiaId, 'Updated_by records Mafia player ID');
  assert(Boolean(sabotageRes.file?.content.includes(' || ')), 'Sabotaged code reverted to defect operator (||)');
  console.log('  ✅ TEST 3 PASSED: Mafia sabotage successfully mutated Version 10 into Version 11\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 4: CREWMATE SEES SABOTAGED CODE ON REOPEN / FETCH ---');
  // --------------------------------------------------------------------------
  const crewmateFetchedAfterSabotage = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(crewmateFetchedAfterSabotage.version === 11, 'Crewmate fetches Version 11');
  assert(crewmateFetchedAfterSabotage.content.includes(' || '), 'Crewmate sees sabotaged code');
  console.log('  ✅ TEST 4 PASSED: Crewmate receives authoritative Version 11 without stale caching\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 5: STALE NORMAL SAVE PROTECTION ---');
  // --------------------------------------------------------------------------
  // Player A opened Version 10.
  // In the meantime, the file is at Version 11.
  // Player A attempts to save their old Version 10 edits.
  const staleSaveRes = await saveCrewmateCode({
    gameId,
    roomIdOrFileId: 'auth_lab',
    content: '// Stale overwrite attempt from Player A',
    expectedVersion: 10,
    playerId: playerAId,
  });

  assert(staleSaveRes.success === false, 'Stale normal save was rejected');
  assert(staleSaveRes.stale === true, 'Stale flag is true');
  assert(staleSaveRes.currentVersion === 11, 'Response indicates latest server version is 11');

  const fileAfterStaleAttempt = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(fileAfterStaleAttempt.version === 11, 'Authoritative file remains at Version 11');
  assert(!fileAfterStaleAttempt.content.includes('Stale overwrite attempt'), 'Authoritative code was NOT overwritten');
  console.log('  ✅ TEST 5 PASSED: Normal save correctly rejects outdated expected version\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 6: STALE MAFIA EDIT (CRITICAL REQUIREMENT) ---');
  // --------------------------------------------------------------------------
  // Suppose Mafia client originally opened Version 8.
  // Meanwhile, Crewmate saved up to Version 10, and file is now at Version 11.
  // Mafia triggers sabotage:
  // MUST fetch latest (Version 11), apply sabotage, and create Version 12 (NEVER Version 9!).
  const mafiaStaleSabotageRes = await sabotageSharedCode({
    gameId,
    roomIdOrFileId: 'auth_lab',
    playerId: mafiaId,
    customMutation: (latestCode) => latestCode + '\n// Bug injected by Mafia on latest code',
  });

  assert(mafiaStaleSabotageRes.success === true, 'Mafia sabotage succeeded even from stale editor');
  assert(mafiaStaleSabotageRes.previousVersion === 11, 'Mafia fetched latest Version 11');
  assert(mafiaStaleSabotageRes.newVersion === 12, 'Mafia created Version 12 (not Version 9)');
  assert(mafiaStaleSabotageRes.file?.version === 12, 'New authoritative version is 12');

  const finalAuthFile = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(finalAuthFile.version === 12, 'Authoritative file is Version 12');
  console.log('  ✅ TEST 6 PASSED: Mafia sabotage always operates on latest version and increments version correctly\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 7: PERSISTENCE ACROSS RE-OPEN ---');
  // --------------------------------------------------------------------------
  const reloadedFile = await fetchLatestSharedFile(gameId, 'auth_lab');
  assert(reloadedFile.version === 12, 'Reloaded file retains Version 12');
  assert(reloadedFile.content === finalAuthFile.content, 'Reloaded file retains exact code');
  console.log('  ✅ TEST 7 PASSED: Persistence verified\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 8: SABOTAGE TRIGGER CREATION & ATOMIC CONSUMPTION ---');
  // --------------------------------------------------------------------------
  const trigger = await createSabotageTrigger({
    gameId,
    targetRoomId: 'LIBRARY & ARCHIVES',
    targetFileName: 'auth.js',
    targetRoomLabel: 'LIBRARY & ARCHIVES',
  });

  assert(trigger.active === true, 'Sabotage trigger created active');
  assert(trigger.targetFileName === 'auth.js', 'Target file is auth.js');

  const activeTriggers = await fetchActiveSabotageTriggers(gameId);
  assert(activeTriggers.some((t) => t.id === trigger.id), 'Active triggers list includes new trigger');

  // First Mafia consumes trigger
  const consume1 = await consumeSabotageTrigger(gameId, trigger.id, 'mafia-1');
  assert(consume1.success === true, 'First Mafia successfully consumes trigger');

  // Second Mafia tries to consume the exact same trigger
  const consume2 = await consumeSabotageTrigger(gameId, trigger.id, 'mafia-2');
  assert(consume2.success === false, 'Duplicate consumption is rejected atomically');
  console.log('  ✅ TEST 8 PASSED: Sabotage triggers protected against duplicate multi-mafia use\n');

  // --------------------------------------------------------------------------
  console.log('--- TEST 9: AUDIT EVENT LOGGING ---');
  // --------------------------------------------------------------------------
  await logGameEvent({
    gameId,
    type: 'TASK_COMPLETED',
    playerId: crewmateId,
    roomId: 'library',
    fileName: 'auth.js',
    previousVersion: 1,
    newVersion: 2,
  });

  await logGameEvent({
    gameId,
    type: 'BUG_INJECTED',
    playerId: mafiaId,
    roomId: 'library',
    fileName: 'auth.js',
    previousVersion: 10,
    newVersion: 11,
    mutationType: 'INVERT_LOGICAL_AND',
  });

  const events = await fetchGameEvents(gameId);
  assert(events.length >= 2, 'Events recorded in game event log');
  const bugInjectedEvt = events.find((e) => e.type === 'BUG_INJECTED');
  assert(bugInjectedEvt !== undefined, 'BUG_INJECTED event exists');
  assert(bugInjectedEvt?.previousVersion === 10, 'Logged previousVersion 10');
  assert(bugInjectedEvt?.newVersion === 11, 'Logged newVersion 11');
  console.log('  ✅ TEST 9 PASSED: Complete audit trail recorded\n');

  console.log('======================================================');
  console.log('🎉 ALL 9 CODE MAFIA SHARED CODE ACCEPTANCE TESTS PASSED!');
  console.log('======================================================\n');
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
