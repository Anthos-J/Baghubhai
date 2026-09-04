import { JAVA_PROBLEMS, getProblemById } from '../src/editor/problemDataset';
import { assignPrivateTasksToPlayers } from '../src/editor/privateTasks';
import { getDefaultTasks } from '../src/game/tasks';
import { Player } from '../src/types/game';

console.log('--- 1. VERIFYING 10 PROBLEMS & 9 BUGS EACH ---');
console.log(`Total Problems: ${JAVA_PROBLEMS.length}`);
if (JAVA_PROBLEMS.length !== 10) {
  throw new Error(`Expected 10 problems, found ${JAVA_PROBLEMS.length}`);
}

let failureCount = 0;
for (const problem of JAVA_PROBLEMS) {
  if (problem.bugs.length !== 9) {
    console.error(`Problem ${problem.id} has ${problem.bugs.length} bugs, expected 9`);
    failureCount++;
  }
  totalBugs += problem.bugs.length;

  for (const bug of problem.bugs) {
    // Verify validator fails on buggyCode
    const failRes = bug.validator(bug.buggyCode);
    const hasFail = failRes.some((r) => !r.passed);
    if (!hasFail) {
      console.error(`[FAIL TEST] Buggy code for ${bug.id} unexpectedly passed!`);
      failureCount++;
    }

    // Verify validator passes on solutionCode
    const passRes = bug.validator(bug.solutionCode);
    const allPass = passRes.every((r) => r.passed);
    if (!allPass) {
      console.error(`[PASS TEST] Solution code for ${bug.id} failed:`, passRes);
      failureCount++;
    }
  }
}
console.log(`Total bugs checked: ${totalBugs}. Total failures: ${failureCount}`);
if (failureCount > 0) {
  process.exit(1);
}
console.log(`Total verified bugs across 10 problems: ${totalBugs} (9 * 10 = 90)`);

console.log('\n--- 2. VERIFYING 3-DEVELOPER ALLOCATION (3 BUGS EACH) ---');
const mockPlayers: Player[] = [
  { id: 'player-1', name: 'Dev1', role: 'DEVELOPER', isAlive: true, x: 0, y: 0, isLocal: true, color: 'blue' },
  { id: 'player-2', name: 'Dev2', role: 'DEVELOPER', isAlive: true, x: 0, y: 0, isLocal: false, color: 'green' },
  { id: 'player-3', name: 'Dev3', role: 'DEVELOPER', isAlive: true, x: 0, y: 0, isLocal: false, color: 'yellow' },
  { id: 'player-4', name: 'Mafia1', role: 'MAFIA', isAlive: true, x: 0, y: 0, isLocal: false, color: 'red' },
];

const selectedProblem = getProblemById('add-two-numbers');
const allocation = assignPrivateTasksToPlayers(mockPlayers, selectedProblem.id);

console.log(`Assigned players count: ${Object.keys(allocation).length}`);
for (const player of mockPlayers) {
  const tasks = allocation[player.id];
  if (!tasks) {
    throw new Error(`Player ${player.id} received no task list!`);
  }
  console.log(`Player ${player.name} (${player.role}): ${tasks.length} tasks`);
  if (player.role === 'DEVELOPER') {
    if (tasks.length !== 3) {
      throw new Error(`Developer ${player.name} should have exactly 3 bugs, but got ${tasks.length}`);
    }
    // Check rooms are unique for this developer
    const rooms = tasks.map(t => t.assignedRoom);
    const uniqueRooms = new Set(rooms);
    if (uniqueRooms.size !== 3) {
      throw new Error(`Developer ${player.name} assigned duplicate rooms: ${rooms.join(', ')}`);
    }
    // Check each task has isolated 1-bug code
    for (const t of tasks) {
      if (!t.initialCode || t.initialCode.trim().length === 0) {
        throw new Error(`Task ${t.id} has empty initialCode!`);
      }
      if (!t.bugIndex) {
        throw new Error(`Task ${t.id} missing bugIndex!`);
      }
    }
  }
}

console.log('\n--- 3. VERIFYING GAME DEFAULT TASKS GENERATION ---');
const gameTasks = getDefaultTasks(selectedProblem.id);
console.log(`Generated game tasks: ${gameTasks.length}`);
if (gameTasks.length !== 9) {
  throw new Error(`Expected 9 game tasks for problem, got ${gameTasks.length}`);
}
for (const gt of gameTasks) {
  console.log(` - Task ${gt.id}: ${gt.name} (Room: ${gt.room}, Points: ${gt.points})`);
}

console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
