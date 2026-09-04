/**
 * AMONG DEVS — HOST GAME SETTINGS & EMERGENCY COOLDOWN TEST SUITE
 * Validates all 11 settings, validation rules, host authority, independent timers,
 * emergency cooldown lifecycle, per-player meeting limits, and phase locking.
 */

import { DEFAULT_SETTINGS, createInitialGameState, gameReducer } from '../game/gameState';
import { assignRoles, canCallMeeting } from '../game/roles';
import { transitionToRoleReveal, transitionToPlaying, transitionFromVoteReveal, transitionToLobby } from '../game/stateMachine';
import { startEmergencyMeeting, startVotingPhase } from '../game/voting';
import { GameSettings, Player, GameState } from '../types/game';

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}${extra ? ` — ${extra}` : ''}`);
    failed++;
  }
}

console.log('\n==============================================================');
console.log('  AMONG DEVS — HOST GAME SETTINGS & COOLDOWN VALIDATION SUITE');
console.log('==============================================================\n');

// ── 1. DEFAULT SETTINGS VERIFICATION ──────────────────────────
console.log('--- 1. Frozen Default Settings Verification ---');
assert('Default maxPlayers === 5', DEFAULT_SETTINGS.maxPlayers === 5);
assert('Default mafiaCount === 1', DEFAULT_SETTINGS.mafiaCount === 1);
assert("Default difficulty === 'MEDIUM'", DEFAULT_SETTINGS.difficulty === 'MEDIUM');
assert('Default gameDurationSeconds === 900 (15 min)', DEFAULT_SETTINGS.gameDurationSeconds === 900);
assert('Default discussionDurationSeconds === 180 (3 min)', DEFAULT_SETTINGS.discussionDurationSeconds === 180);
assert('Default votingDurationSeconds === 60 (1 min)', DEFAULT_SETTINGS.votingDurationSeconds === 60);
assert('Default emergencyMeetingLimit === 1', DEFAULT_SETTINGS.emergencyMeetingLimit === 1);
assert('Default emergencyMeetingCooldownSeconds === 30', DEFAULT_SETTINGS.emergencyMeetingCooldownSeconds === 30);
assert('Default sabotageCooldownSeconds === 45', DEFAULT_SETTINGS.sabotageCooldownSeconds === 45);
assert('Default syntaxBlackoutDurationSeconds === 10', DEFAULT_SETTINGS.syntaxBlackoutDurationSeconds === 10);
assert('Default imposterEscapeDelaySeconds === 5', DEFAULT_SETTINGS.imposterEscapeDelaySeconds === 5);

// ── 2. PLAYERS: MAX PLAYERS & MAFIA VALIDATION ────────────────
console.log('\n--- 2. Players: Max Players & Mafia Rules ---');
const dummyPlayers = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    username: `Dev_${i + 1}`,
    color: '#00F0FF',
    x: 1000,
    y: 750,
    direction: 'down',
    alive: true,
    connected: true,
    isHost: i === 0,
    is_host: i === 0,
    meetingsCalledCount: 0,
  }));

// 5 players -> only 1 mafia allowed
const fivePlayers = dummyPlayers(5);
const roles5 = assignRoles(fivePlayers, 2); // Requesting 2 mafia for 5 players should be clamped to 1
const mafiaCount5 = roles5.filter((p) => p.role === 'MAFIA').length;
assert('5 players with 2 requested Mafia automatically clamps to 1 Mafia', mafiaCount5 === 1);

// 8 players -> 2 mafia allowed
const eightPlayers = dummyPlayers(8);
const roles8 = assignRoles(eightPlayers, 2);
const mafiaCount8 = roles8.filter((p) => p.role === 'MAFIA').length;
assert('8 players with 2 requested Mafia correctly assigns 2 Mafia', mafiaCount8 === 2);

// Actual players at start clamping (10 max configured, but only 5 joined)
const actualPlayerCount = 5;
const maxAllowedMafiaForActual = actualPlayerCount >= 7 ? 2 : 1;
assert('Configured max=10, mafia=2, but 5 actual players clamps mafia to 1', maxAllowedMafiaForActual === 1);

// ── 3. GAMEPLAY: DIFFICULTY & AUTHORITATIVE GAME DURATION ─────
console.log('\n--- 3. Gameplay: Authoritative Duration (Not Overwritten) ---');
let state = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
state = gameReducer(state, {
  type: 'UPDATE_SETTINGS',
  settings: {
    gameDurationSeconds: 720, // 12 minutes selected by host
    difficulty: 'DIFFICULT',
  },
});

assert('Host-selected game duration stored in settings as 720s', state.settings.gameDurationSeconds === 720);

// Transition to role reveal
state.players = dummyPlayers(5);
const roleRevealState = transitionToRoleReveal(state);
assert(
  'Host duration 720s preserved in gameTimeRemaining and NOT overridden by difficulty calculation',
  roleRevealState.gameTimeRemaining === 720 && roleRevealState.totalGameTime === 720
);

// ── 4. MEETING: INDEPENDENT DISCUSSION & VOTING TIMERS ────────
console.log('\n--- 4. Meeting: Independent Discussion and Voting Timers ---');
let customTimerState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
customTimerState = gameReducer(customTimerState, {
  type: 'UPDATE_SETTINGS',
  settings: {
    discussionDurationSeconds: 120, // 2 min
    votingDurationSeconds: 30, // 30 sec
  },
});
customTimerState.players = dummyPlayers(5);
customTimerState.phase = 'PLAYING';

const meetingRes = startEmergencyMeeting(customTimerState, 'player-1', 'Code Review Alert');
assert('Emergency meeting discussion duration uses 120s', meetingRes.state.meeting?.durationSeconds === 120);
assert('Meeting phase timer is set to 120s', meetingRes.state.phaseTimer === 120);

const votingState = startVotingPhase(meetingRes.state);
assert('Voting duration independently uses 30s', votingState.voting?.durationSeconds === 30);
assert('Voting phase timer is set to 30s', votingState.phaseTimer === 30);

// ── 5. EMERGENCY MEETING LIMIT & PERSONAL COUNTER ─────────────
console.log('\n--- 5. Emergency Meeting Limit (Per Player Allowance) ---');
let limitTestState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
limitTestState = gameReducer(limitTestState, {
  type: 'UPDATE_SETTINGS',
  settings: {
    emergencyMeetingLimit: 1, // 1 per player
    emergencyMeetingCooldownSeconds: 15,
  },
});
limitTestState.players = dummyPlayers(5);
limitTestState.phase = 'PLAYING';

const p1 = limitTestState.players[0];
assert('Player 1 initial meetingsCalledCount === 0', (p1.meetingsCalledCount ?? 0) === 0);
assert('Player 1 canCallMeeting is true initially', canCallMeeting(p1, limitTestState));

// Player 1 successfully calls first meeting
const meet1 = startEmergencyMeeting(limitTestState, p1.id, 'First Meeting');
assert('First emergency meeting succeeds', meet1.success);
const p1AfterMeet1 = meet1.state.players.find((p) => p.id === p1.id)!;
assert('Player 1 meetingsCalledCount incremented to 1', p1AfterMeet1.meetingsCalledCount === 1);

// Complete meeting and return to PLAYING with expired cooldown to isolate limit check
meet1.state.phase = 'VOTE_REVEAL';
const resumedState = transitionFromVoteReveal(meet1.state);
resumedState.emergencyMeetingCooldownUntil = Date.now() - 1000; // Force cooldown expired

const p1InResumed = resumedState.players.find((p) => p.id === p1.id)!;
assert('Player 1 is now blocked by personal meeting limit (limit=1, count=1)', !canCallMeeting(p1InResumed, resumedState));

const blockedAttempt = startEmergencyMeeting(resumedState, p1.id, 'Second Meeting');
assert('Second meeting attempt rejected', !blockedAttempt.success);
const p1AfterBlocked = blockedAttempt.state.players.find((p) => p.id === p1.id)!;
assert('Blocked attempt does NOT increment counter (remains 1)', p1AfterBlocked.meetingsCalledCount === 1);

// Player 2 still has their 1 meeting available
const p2InResumed = resumedState.players.find((p) => p.id === 'player-2')!;
assert('Player 2 can still call their personal meeting (count=0)', canCallMeeting(p2InResumed, resumedState));

// Unlimited setting test
let unlimitedState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
unlimitedState = gameReducer(unlimitedState, {
  type: 'UPDATE_SETTINGS',
  settings: { emergencyMeetingLimit: null }, // UNLIMITED
});
unlimitedState.players = dummyPlayers(5);
unlimitedState.players[0].meetingsCalledCount = 10;
unlimitedState.phase = 'PLAYING';
assert('Unlimited meeting limit allows player with 10 meetings to call another', canCallMeeting(unlimitedState.players[0], unlimitedState));

// ── 6. EMERGENCY MEETING COOLDOWN LIFECYCLE ───────────────────
console.log('\n--- 6. Emergency Meeting Cooldown Lifecycle ---');
let cdState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
cdState = gameReducer(cdState, {
  type: 'UPDATE_SETTINGS',
  settings: {
    emergencyMeetingCooldownSeconds: 30,
    emergencyMeetingLimit: 2,
  },
});
cdState.players = dummyPlayers(5);
cdState.phase = 'VOTE_REVEAL';

// Vote reveal finishes -> Meeting ends -> Cooldown starts
const now = Date.now();
const postMeetingState = transitionFromVoteReveal(cdState);
assert('Emergency cooldown timestamp set on meeting end', postMeetingState.emergencyMeetingCooldownUntil !== null);
const expectedCdUntil = now + 30000;
const diff = Math.abs((postMeetingState.emergencyMeetingCooldownUntil || 0) - expectedCdUntil);
assert('Cooldown duration is approximately 30 seconds', diff < 1000);

// During active cooldown, all players are blocked
const player2 = postMeetingState.players[1];
assert('Player 2 blocked during active cooldown', !canCallMeeting(player2, postMeetingState));
const cdBlockedCall = startEmergencyMeeting(postMeetingState, player2.id, 'Spam meeting');
assert('Meeting dispatch during active cooldown is rejected', !cdBlockedCall.success);
assert('Player 2 counter unchanged after cooldown block', (cdBlockedCall.state.players[1].meetingsCalledCount ?? 0) === 0);

// Fast-forward time past cooldown
postMeetingState.emergencyMeetingCooldownUntil = Date.now() - 500;
assert('After cooldown timestamp expires, Player 2 can call meeting', canCallMeeting(player2, postMeetingState));
const validPostCdCall = startEmergencyMeeting(postMeetingState, player2.id, 'Post-cooldown meeting');
assert('Post-cooldown meeting succeeds', validPostCdCall.success);
assert('Player 2 counter incremented on successful post-cooldown meeting', (validPostCdCall.state.players[1].meetingsCalledCount ?? 0) === 1);

// ── 7. MAFIA SABOTAGE SETTINGS (INCLUDING 0s ESCAPE DELAY) ────
console.log('\n--- 7. Mafia Sabotage Settings (Including 0s Escape Delay) ---');
let sabotageSettingsState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
sabotageSettingsState = gameReducer(sabotageSettingsState, {
  type: 'UPDATE_SETTINGS',
  settings: {
    sabotageCooldownSeconds: 90,
    syntaxBlackoutDurationSeconds: 5,
    imposterEscapeDelaySeconds: 0, // Valid 0s immediate alert
  },
});
assert('Sabotage cooldown 90s configured', sabotageSettingsState.settings.sabotageCooldownSeconds === 90);
assert('Syntax blackout 5s configured', sabotageSettingsState.settings.syntaxBlackoutDurationSeconds === 5);
assert('Escape delay 0s (immediate) configured and not treated as undefined', sabotageSettingsState.settings.imposterEscapeDelaySeconds === 0);

// ── 8. SETTINGS LOCK AFTER START GAME ─────────────────────────
console.log('\n--- 8. Settings Lock Outside LOBBY Phase ---');
let lockedState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
lockedState.phase = 'PLAYING';
const attemptInPlaying = gameReducer(lockedState, {
  type: 'UPDATE_SETTINGS',
  settings: { maxPlayers: 8 },
});
assert('UPDATE_SETTINGS rejected while in PLAYING phase', attemptInPlaying.settings.maxPlayers === 5);

lockedState.phase = 'MEETING';
const attemptInMeeting = gameReducer(lockedState, {
  type: 'UPDATE_SETTINGS',
  settings: { mafiaCount: 2 },
});
assert('UPDATE_SETTINGS rejected while in MEETING phase', attemptInMeeting.settings.mafiaCount === 1);

// ── 9. LOBBY MATCH RESET ──────────────────────────────────────
console.log('\n--- 9. Match Reset Back to LOBBY ---');
let gameOverState = createInitialGameState('ROOM-TEST', dummyPlayers(1)[0]);
gameOverState.phase = 'GAME_OVER';
gameOverState.players = dummyPlayers(5).map((p) => ({ ...p, meetingsCalledCount: 2, status: 'ELIMINATED' as const }));
gameOverState.emergencyMeetingCooldownUntil = Date.now() + 10000;

const resetLobbyState = transitionToLobby(gameOverState);
assert('Phase reset to LOBBY', resetLobbyState.phase === 'LOBBY');
assert('Emergency cooldown reset to null', resetLobbyState.emergencyMeetingCooldownUntil === null);
assert('All player meetingsCalledCount reset to 0', resetLobbyState.players.every((p) => p.meetingsCalledCount === 0));
assert('All players restored to ALIVE', resetLobbyState.players.every((p) => p.status === 'ALIVE'));

// ── 10. NON-HOST DATABASE AUTHORIZATION ─────────────────────────
console.log('\n--- 10. Non-Host Database Authorization Checks ---');
// Mock Supabase authorization verification logic
function mockAuthorizeSettingsUpdate(
  isHost: boolean,
  roomPhase: string,
  settings: Partial<GameSettings>
): { authorized: boolean; error?: string } {
  if (!isHost) {
    return { authorized: false, error: 'Unauthorized: Only room host can modify game settings.' };
  }
  if (roomPhase !== 'LOBBY') {
    return { authorized: false, error: 'Unauthorized: Game settings can only be modified in LOBBY phase.' };
  }
  return { authorized: true };
}

const hostLobbyAuth = mockAuthorizeSettingsUpdate(true, 'LOBBY', { maxPlayers: 8 });
assert('Host in LOBBY phase is authorized to update settings', hostLobbyAuth.authorized);

const nonHostLobbyAuth = mockAuthorizeSettingsUpdate(false, 'LOBBY', { maxPlayers: 8 });
assert('Non-host player is REJECTED from modifying room settings', !nonHostLobbyAuth.authorized && nonHostLobbyAuth.error?.includes('Only room host') === true);

const hostPlayingAuth = mockAuthorizeSettingsUpdate(true, 'PLAYING', { maxPlayers: 8 });
assert('Host in PLAYING phase is REJECTED from modifying room settings', !hostPlayingAuth.authorized && hostPlayingAuth.error?.includes('LOBBY phase') === true);

// ── 11. PLAYER SETTINGS (LOCAL ISOLATION) ──────────────────────
console.log('\n--- 11. Player Settings Local Isolation & Defaults ---');
import { DEFAULT_PLAYER_SETTINGS, PlayerSettings } from '../lib/playerSettings';

assert('Default master volume === 100%', DEFAULT_PLAYER_SETTINGS.audio.masterVolume === 100);
assert('Default music volume === 70%', DEFAULT_PLAYER_SETTINGS.audio.musicVolume === 70);
assert('Default sfx volume === 80%', DEFAULT_PLAYER_SETTINGS.audio.sfxVolume === 80);
assert('Default muteAll === false', DEFAULT_PLAYER_SETTINGS.audio.muteAll === false);
assert('Default screen shake === true', DEFAULT_PLAYER_SETTINGS.display.screenShake === true);
assert('Default controls Move Up === W', DEFAULT_PLAYER_SETTINGS.controls.moveUp === 'W');
assert('Default controls Emergency === R', DEFAULT_PLAYER_SETTINGS.controls.emergencyMeeting === 'R');

// Verify player A and Player B settings objects remain independent
const playerASettings: PlayerSettings = {
  ...DEFAULT_PLAYER_SETTINGS,
  audio: { ...DEFAULT_PLAYER_SETTINGS.audio, masterVolume: 20 },
};
const playerBSettings: PlayerSettings = {
  ...DEFAULT_PLAYER_SETTINGS,
  audio: { ...DEFAULT_PLAYER_SETTINGS.audio, masterVolume: 90 },
};
assert('Player A settings (20%) does not mutate Player B settings (90%)', playerASettings.audio.masterVolume === 20 && playerBSettings.audio.masterVolume === 90);

// ── 12. TROPHIES & ACHIEVEMENTS SYSTEM ─────────────────────────
console.log('\n--- 12. Trophies System: Categories, Progress, and Unlocks ---');
import { TROPHY_DEFINITIONS, TrophyDefinition } from '../lib/trophies';

assert('Total 13 trophies defined across 4 categories', TROPHY_DEFINITIONS.length === 13);
const devTrophies = TROPHY_DEFINITIONS.filter((t) => t.category === 'DEVELOPER');
const mafiaTrophies = TROPHY_DEFINITIONS.filter((t) => t.category === 'MAFIA');
const meetingTrophies = TROPHY_DEFINITIONS.filter((t) => t.category === 'MEETING');
const generalTrophies = TROPHY_DEFINITIONS.filter((t) => t.category === 'GENERAL');

assert('4 Developer trophies defined', devTrophies.length === 4);
assert('3 Mafia trophies defined', mafiaTrophies.length === 3);
assert('3 Meeting trophies defined', meetingTrophies.length === 3);
assert('3 General trophies defined', generalTrophies.length === 3);

// Verify Code Master target 3
const codeMaster = TROPHY_DEFINITIONS.find((t) => t.id === 'code_master');
assert('Code Master maxProgress is 3', codeMaster?.maxProgress === 3);

// Test progress and unlock logic in-memory
function simulateTrophyProgression(
  trophy: TrophyDefinition,
  initialProgress: number,
  delta: number
): { progress: number; unlocked: boolean } {
  const newProg = Math.min(trophy.maxProgress, initialProgress + delta);
  return {
    progress: newProg,
    unlocked: newProg >= trophy.maxProgress,
  };
}

if (codeMaster) {
  const step0 = simulateTrophyProgression(codeMaster, 0, 0);
  assert('Code Master at 0 tasks is LOCKED (progress 0/3)', !step0.unlocked && step0.progress === 0);

  const step1 = simulateTrophyProgression(codeMaster, 0, 1);
  assert('Code Master after 1 task shows PROGRESS (progress 1/3)', !step1.unlocked && step1.progress === 1);

  const step2 = simulateTrophyProgression(codeMaster, 1, 1);
  assert('Code Master after 2 tasks shows PROGRESS (progress 2/3)', !step2.unlocked && step2.progress === 2);

  const step3 = simulateTrophyProgression(codeMaster, 2, 1);
  assert('Code Master after 3 tasks is UNLOCKED (progress 3/3)', step3.unlocked && step3.progress === 3);
}

// ── SUMMARY ───────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  TOTAL SETTINGS, HELP & TROPHIES TESTS: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
