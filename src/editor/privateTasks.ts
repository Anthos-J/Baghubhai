/**
 * privateTasks.ts — Private Debugging & Task Isolation Subsystem
 *
 * Provides:
 * 1. Multiple independent task definitions per file/room.
 * 2. Scoped code section isolation (players see ONLY their assigned code region).
 * 3. Privacy protection (zero leakage of other players' tasks or code buffers).
 * 4. Deterministic section validators (zero eval / zero arbitrary code execution).
 * 5. Lifecycle states: ASSIGNED -> IN_PROGRESS -> COMPLETED -> COMPROMISED -> IN_PROGRESS -> COMPLETED.
 */

import { sanitizeSource, TestResult } from './testRunner';
import { getRoomMapping } from './roomMapping';
import { PREBUILT_CHALLENGES } from '../services/challengeService';

export type TaskLifecycleStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'COMPROMISED';

// ── Public Project Metadata (Visible to all players) ─────────────────────────
export interface PublicProjectContext {
  projectId: string;
  title: string;
  system: string;
  description: string;
  objective: string;
  filesSummary: string[];
}

export const PUBLIC_PROJECT_CONTEXT: PublicProjectContext = {
  projectId: 'space-station-core-services',
  title: 'SPACE STATION CORE SERVICES',
  system: 'Deep Space Orbital Server Cluster v2.4',
  description: 'Mission-critical spacecraft microservice cluster providing user authentication, transaction processing, real-time database caching, sorted utility telemetry, and bootstrap lifecycle management.',
  objective: 'Debug faulty functions, eliminate security vulnerabilities in your assigned terminal section, and restore global system stability to 100%.',
  filesSummary: [
    'auth.js (Access Control)',
    'database.js (Storage Layer)',
    'payment.js (Credits & Billing)',
    'utils.js (Telemetry Sorting)',
    'app.js (Mainframe Bootstrap)'
  ],
};

export interface TaskSectionDefinition {
  id: string;
  fileId: string;
  fileName: string;
  roomId: string;
  roomLabel: string;
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string;
  mutatedBugCode: string;
  testKey: string;
  hint: string;
  validator: (code: string) => TestResult[];
}

export interface PrivatePlayerTask {
  taskId: string;
  assignedPlayerId: string;
  fileId: string;
  fileName: string;
  roomId: string;
  roomLabel: string;
  title: string;
  description: string;
  sectionCode: string;
  baselineCode: string;
  status: TaskLifecycleStatus;
  testKey: string;
  hint: string;
  completedAt?: number;
  compromisedAt?: number;
}


// ── Multi-Task Section Registry ───────────────────────────────────────────────
export const TASK_SECTIONS: TaskSectionDefinition[] = [
  // ── AUTH LAB (auth.js) ──
  {
    id: 'task-auth-login',
    fileId: 'file-auth',
    fileName: 'auth.js',
    roomId: 'auth_lab',
    roomLabel: 'AUTH LAB',
    title: 'Fix Authentication Authorization Logic',
    description: 'The login condition uses OR (||) instead of AND (&&), allowing unauthorized credentials to bypass security.',
    initialCode: `export function login(username, password) {\n  // BUG: Uses OR (||) instead of AND (&&) allowing unauthorized access\n  if (username === "admin" || password === "admin123") {\n    return { success: true, token: "jwt_token_admin_authorized" };\n  }\n  return { success: false, error: "Invalid credentials" };\n}`,
    solutionCode: `export function login(username, password) {\n  if (username === "admin" && password === "admin123") {\n    return { success: true, token: "jwt_token_admin_authorized" };\n  }\n  return { success: false, error: "Invalid credentials" };\n}`,
    mutatedBugCode: `export function login(username, password) {\n  if (username === "admin" || password === "admin123") {\n    return { success: true, token: "jwt_token_admin_authorized" };\n  }\n  return { success: false, error: "Invalid credentials" };\n}`,
    testKey: 'test-auth-login',
    hint: 'Replace || with && to verify both username and password.',
    validator: (code: string) => {
      const { cleanCode, structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];

      const hasAnd = structureCode.includes('&&');
      const hasOr = structureCode.includes('||');
      const hasCorrectCredentials = cleanCode.includes('"admin"') && cleanCode.includes('"admin123"');

      if (!hasAnd || hasOr) {
        results.push({
          testId: 'auth-login-01',
          taskId: 'task-auth-login',
          fileId: 'file-auth',
          name: 'Strict AND operator authentication check',
          passed: false,
          message: 'FAILED: Login must strictly use AND (&&) without OR (||) bypass.',
        });
      } else if (!hasCorrectCredentials) {
        results.push({
          testId: 'auth-login-02',
          taskId: 'task-auth-login',
          fileId: 'file-auth',
          name: 'Valid admin credential check',
          passed: false,
          message: 'FAILED: Must validate against username "admin" and password "admin123".',
        });
      } else {
        results.push({
          testId: 'auth-login-01',
          taskId: 'task-auth-login',
          fileId: 'file-auth',
          name: 'Strict authentication logic passed',
          passed: true,
          message: 'PASSED: Login logic securely validates authorization credentials.',
        });
      }
      return results;
    },
  },
  {
    id: 'task-auth-session',
    fileId: 'file-auth',
    fileName: 'auth.js',
    roomId: 'auth_lab',
    roomLabel: 'AUTH LAB',
    title: 'Fix Session Token Validation Prefix',
    description: 'validateSession must ensure token exists and starts with "jwt_token_".',
    initialCode: `export function validateSession(token) {\n  // BUG: Returns false unconditionally\n  if (!token) return true;\n  return false;\n}`,
    solutionCode: `export function validateSession(token) {\n  if (!token) return false;\n  return token.startsWith("jwt_token_");\n}`,
    mutatedBugCode: `export function validateSession(token) {\n  if (!token) return true;\n  return false;\n}`,
    testKey: 'test-auth-session',
    hint: 'Return token.startsWith("jwt_token_") when token is present.',
    validator: (code: string) => {
      const { cleanCode, structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      const hasPrefix = cleanCode.includes('jwt_token_') && (cleanCode.includes('startsWith') || cleanCode.includes('indexOf'));
      const blocksNull = structureCode.includes('!token');

      if (hasPrefix && blocksNull) {
        results.push({
          testId: 'auth-session-01',
          taskId: 'task-auth-session',
          fileId: 'file-auth',
          name: 'Session token validation',
          passed: true,
          message: 'PASSED: Session tokens are validated accurately.',
        });
      } else {
        results.push({
          testId: 'auth-session-01',
          taskId: 'task-auth-session',
          fileId: 'file-auth',
          name: 'Session token validation',
          passed: false,
          message: 'FAILED: validateSession must check token prefix "jwt_token_".',
        });
      }
      return results;
    },
  },

  // ── UTILITIES LAB (utils.js) ──
  {
    id: 'task-utils-sort',
    fileId: 'file-utils',
    fileName: 'utils.js',
    roomId: 'utilities_lab',
    roomLabel: 'UTILITIES LAB',
    title: 'Sort Scores Ascending Order',
    description: 'Utility helper is sorting scores in descending order (b - a) instead of ascending (a - b).',
    initialCode: `export function sortScoresAscending(scores) {\n  if (!Array.isArray(scores)) return [];\n  // BUG: Sorting descending (b - a) instead of ascending (a - b)\n  return [...scores].sort((a, b) => b - a);\n}`,
    solutionCode: `export function sortScoresAscending(scores) {\n  if (!Array.isArray(scores)) return [];\n  return [...scores].sort((a, b) => a - b);\n}`,
    mutatedBugCode: `export function sortScoresAscending(scores) {\n  if (!Array.isArray(scores)) return [];\n  return [...scores].sort((a, b) => b - a);\n}`,
    testKey: 'test-utils-sort',
    hint: 'Change comparator from (b - a) to (a - b).',
    validator: (code: string) => {
      const { structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      const clean = structureCode.replace(/\s+/g, '');

      if (clean.includes('a-b') && !clean.includes('b-a')) {
        results.push({
          testId: 'utils-sort-01',
          taskId: 'task-utils-sort',
          fileId: 'file-utils',
          name: 'Ascending score sort',
          passed: true,
          message: 'PASSED: Scores sorted in ascending order.',
        });
      } else {
        results.push({
          testId: 'utils-sort-01',
          taskId: 'task-utils-sort',
          fileId: 'file-utils',
          name: 'Ascending score sort',
          passed: false,
          message: 'FAILED: Must use ascending comparator (a - b).',
        });
      }
      return results;
    },
  },
  {
    id: 'task-utils-sanitize',
    fileId: 'file-utils',
    fileName: 'utils.js',
    roomId: 'utilities_lab',
    roomLabel: 'UTILITIES LAB',
    title: 'Fix String Sanitization Helper',
    description: 'sanitizeInput must verify string type and trim whitespace.',
    initialCode: `export function sanitizeInput(str) {\n  // BUG: Returns raw object without trimming\n  return str;\n}`,
    solutionCode: `export function sanitizeInput(str) {\n  if (typeof str !== 'string') return '';\n  return str.trim();\n}`,
    mutatedBugCode: `export function sanitizeInput(str) {\n  return str;\n}`,
    testKey: 'test-utils-sanitize',
    hint: 'Return str.trim() after checking typeof str === "string".',
    validator: (code: string) => {
      const { cleanCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      if (cleanCode.includes('.trim()')) {
        results.push({
          testId: 'utils-sanitize-01',
          taskId: 'task-utils-sanitize',
          fileId: 'file-utils',
          name: 'Input trimming sanitization',
          passed: true,
          message: 'PASSED: String sanitization verified.',
        });
      } else {
        results.push({
          testId: 'utils-sanitize-01',
          taskId: 'task-utils-sanitize',
          fileId: 'file-utils',
          name: 'Input trimming sanitization',
          passed: false,
          message: 'FAILED: sanitizeInput must call .trim().',
        });
      }
      return results;
    },
  },

  // ── DATABASE ROOM (database.js) ──
  {
    id: 'task-db-connect',
    fileId: 'file-database',
    fileName: 'database.js',
    roomId: 'database_room',
    roomLabel: 'DATABASE ROOM',
    title: 'Fix Database Connection Adapter',
    description: 'connectDatabase() is hardcoded to return false.',
    initialCode: `export function connectDatabase() {\n  // BUG: Hardcoded to return false (connection failure)\n  return false;\n}`,
    solutionCode: `export function connectDatabase() {\n  return true;\n}`,
    mutatedBugCode: `export function connectDatabase() {\n  return false;\n}`,
    testKey: 'test-db-connect',
    hint: 'Return true from connectDatabase.',
    validator: (code: string) => {
      const { structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      const clean = structureCode.replace(/\s+/g, ' ').trim();

      if (clean.includes('return true') || clean.includes('=> true')) {
        results.push({
          testId: 'db-connect-01',
          taskId: 'task-db-connect',
          fileId: 'file-database',
          name: 'Database adapter connection',
          passed: true,
          message: 'PASSED: connectDatabase returns true.',
        });
      } else {
        results.push({
          testId: 'db-connect-01',
          taskId: 'task-db-connect',
          fileId: 'file-database',
          name: 'Database adapter connection',
          passed: false,
          message: 'FAILED: connectDatabase must return true.',
        });
      }
      return results;
    },
  },
  {
    id: 'task-db-ping',
    fileId: 'file-database',
    fileName: 'database.js',
    roomId: 'database_room',
    roomLabel: 'DATABASE ROOM',
    title: 'Fix Database Ping Response',
    description: 'pingDatabase must return "PONG" when connected and "DISCONNECTED" otherwise.',
    initialCode: `export function pingDatabase() {\n  // BUG: Always returns ERROR\n  return "ERROR";\n}`,
    solutionCode: `export function pingDatabase() {\n  const isConnected = connectDatabase();\n  return isConnected ? "PONG" : "DISCONNECTED";\n}`,
    mutatedBugCode: `export function pingDatabase() {\n  return "ERROR";\n}`,
    testKey: 'test-db-ping',
    hint: 'Return "PONG" when isConnected is true.',
    validator: (code: string) => {
      const { cleanCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      if (cleanCode.includes('"PONG"') || cleanCode.includes("'PONG'")) {
        results.push({
          testId: 'db-ping-01',
          taskId: 'task-db-ping',
          fileId: 'file-database',
          name: 'Database ping response',
          passed: true,
          message: 'PASSED: Database ping handler responds with PONG.',
        });
      } else {
        results.push({
          testId: 'db-ping-01',
          taskId: 'task-db-ping',
          fileId: 'file-database',
          name: 'Database ping response',
          passed: false,
          message: 'FAILED: pingDatabase must return "PONG".',
        });
      }
      return results;
    },
  },

  // ── PAYMENT LAB (payment.js) ──
  {
    id: 'task-payment-validate',
    fileId: 'file-payment',
    fileName: 'payment.js',
    roomId: 'payment_lab',
    roomLabel: 'PAYMENT LAB',
    title: 'Fix Zero-Amount Transaction Exploit',
    description: 'Transaction logic permits amount >= 0 instead of amount > 0, allowing zero-amount exploits.',
    initialCode: `export function processTransaction(amount, balance) {\n  // BUG: Amount >= 0 allows zero-amount exploit transactions\n  if (amount >= 0 && balance >= amount) {\n    return { status: "PROCESSED", newBalance: balance - amount };\n  }\n  return { status: "REJECTED", reason: "Invalid transaction amount or insufficient balance" };\n}`,
    solutionCode: `export function processTransaction(amount, balance) {\n  if (amount > 0 && balance >= amount) {\n    return { status: "PROCESSED", newBalance: balance - amount };\n  }\n  return { status: "REJECTED", reason: "Invalid transaction amount or insufficient balance" };\n}`,
    mutatedBugCode: `export function processTransaction(amount, balance) {\n  if (amount >= 0 && balance >= amount) {\n    return { status: "PROCESSED", newBalance: balance - amount };\n  }\n  return { status: "REJECTED", reason: "Invalid transaction amount or insufficient balance" };\n}`,
    testKey: 'test-payment-validate',
    hint: 'Strictly check amount > 0.',
    validator: (code: string) => {
      const { structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      const clean = structureCode.replace(/\s+/g, '');

      if (clean.includes('amount>0') && !clean.includes('amount>=0') && !clean.includes('amount<=0')) {
        results.push({
          testId: 'payment-val-01',
          taskId: 'task-payment-validate',
          fileId: 'file-payment',
          name: 'Strictly positive payment amount',
          passed: true,
          message: 'PASSED: Payments require strictly positive amount > 0.',
        });
      } else {
        results.push({
          testId: 'payment-val-01',
          taskId: 'task-payment-validate',
          fileId: 'file-payment',
          name: 'Strictly positive payment amount',
          passed: false,
          message: 'FAILED: Must use amount > 0 and reject amount >= 0.',
        });
      }
      return results;
    },
  },
  {
    id: 'task-payment-fee',
    fileId: 'file-payment',
    fileName: 'payment.js',
    roomId: 'payment_lab',
    roomLabel: 'PAYMENT LAB',
    title: 'Fix Payment Processing Fee Calculation',
    description: 'calculateFee must apply a 2.5% fee on transaction amounts.',
    initialCode: `export function calculateFee(amount) {\n  // BUG: Returns 0 fee\n  return 0;\n}`,
    solutionCode: `export function calculateFee(amount) {\n  return amount * 0.025;\n}`,
    mutatedBugCode: `export function calculateFee(amount) {\n  return 0;\n}`,
    testKey: 'test-payment-fee',
    hint: 'Return amount * 0.025.',
    validator: (code: string) => {
      const { structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      if (structureCode.includes('0.025') || structureCode.includes('0.0250')) {
        results.push({
          testId: 'payment-fee-01',
          taskId: 'task-payment-fee',
          fileId: 'file-payment',
          name: 'Processing fee calculation',
          passed: true,
          message: 'PASSED: Fee calculation formula verified.',
        });
      } else {
        results.push({
          testId: 'payment-fee-01',
          taskId: 'task-payment-fee',
          fileId: 'file-payment',
          name: 'Processing fee calculation',
          passed: false,
          message: 'FAILED: calculateFee must multiply amount by 0.025.',
        });
      }
      return results;
    },
  },

  // ── MAINFRAME (app.js) ──
  {
    id: 'task-app-ready',
    fileId: 'file-app',
    fileName: 'app.js',
    roomId: 'mainframe',
    roomLabel: 'MAINFRAME',
    title: 'Fix Production Readiness Inversion',
    description: 'initializeApp is inverting the ready status for production.',
    initialCode: `export function initializeApp(config) {\n  if (!config) return { ready: false, error: "Missing configuration" };\n  const isProd = config.env === "production";\n  // BUG: Inverted ready status\n  return { ready: isProd ? false : true, env: config.env || "development" };\n}`,
    solutionCode: `export function initializeApp(config) {\n  if (!config) return { ready: false, error: "Missing configuration" };\n  const isProd = config.env === "production";\n  return { ready: isProd ? true : false, env: config.env || "development" };\n}`,
    mutatedBugCode: `export function initializeApp(config) {\n  if (!config) return { ready: false, error: "Missing configuration" };\n  const isProd = config.env === "production";\n  return { ready: isProd ? false : true, env: config.env || "development" };\n}`,
    testKey: 'test-app-ready',
    hint: 'Set ready: isProd ? true : false or ready: true.',
    validator: (code: string) => {
      const { cleanCode, structureCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      const clean = structureCode.replace(/\s+/g, '');

      if (clean.includes('isProd?true:false') || clean.includes('ready:true') || clean.includes('ready:isProd')) {
        results.push({
          testId: 'app-ready-01',
          taskId: 'task-app-ready',
          fileId: 'file-app',
          name: 'Production readiness status',
          passed: true,
          message: 'PASSED: initializeApp sets ready to true in production.',
        });
      } else {
        results.push({
          testId: 'app-ready-01',
          taskId: 'task-app-ready',
          fileId: 'file-app',
          name: 'Production readiness status',
          passed: false,
          message: 'FAILED: initializeApp must set ready: true when isProd is active.',
        });
      }
      return results;
    },
  },
  {
    id: 'task-app-health',
    fileId: 'file-app',
    fileName: 'app.js',
    roomId: 'mainframe',
    roomLabel: 'MAINFRAME',
    title: 'Fix Mainframe Service Health Check',
    description: 'getHealthStatus must return status "ONLINE".',
    initialCode: `export function getHealthStatus() {\n  // BUG: Returns DEGRADED\n  return "DEGRADED";\n}`,
    solutionCode: `export function getHealthStatus() {\n  return "ONLINE";\n}`,
    mutatedBugCode: `export function getHealthStatus() {\n  return "DEGRADED";\n}`,
    testKey: 'test-app-health',
    hint: 'Return "ONLINE" from getHealthStatus.',
    validator: (code: string) => {
      const { cleanCode } = sanitizeSource(code);
      const results: TestResult[] = [];
      if (cleanCode.includes('"ONLINE"') || cleanCode.includes("'ONLINE'")) {
        results.push({
          testId: 'app-health-01',
          taskId: 'task-app-health',
          fileId: 'file-app',
          name: 'Mainframe health check',
          passed: true,
          message: 'PASSED: Service health reports ONLINE.',
        });
      } else {
        results.push({
          testId: 'app-health-01',
          taskId: 'task-app-health',
          fileId: 'file-app',
          name: 'Mainframe health check',
          passed: false,
          message: 'FAILED: getHealthStatus must return "ONLINE".',
        });
      }
      return results;
    },
  },
];

// ── Alias mapping for legacy single-task lookups (Backward Compatibility) ─────
export const LEGACY_TASK_ALIAS: Record<string, string> = {
  'task-auth': 'task-auth-login',
  'task-utils': 'task-utils-sort',
  'task-database': 'task-db-connect',
  'task-payment': 'task-payment-validate',
  'task-app': 'task-app-ready',
};

/**
 * Resolves a section definition by taskId or legacy taskId.
 */
export function getTaskSectionDefinition(taskId: string): TaskSectionDefinition | undefined {
  const targetId = LEGACY_TASK_ALIAS[taskId] || taskId;
  return TASK_SECTIONS.find(t => t.id === targetId);
}

/**
 * Gets all task sections mapped to a room ID or room display name.
 */
export function getTaskSectionsForRoom(room: string): TaskSectionDefinition[] {
  const norm = room.toLowerCase().replace(/\s+/g, '_');
  return TASK_SECTIONS.filter(t => t.roomId === norm || t.roomLabel.toLowerCase() === room.toLowerCase());
}

/**
 * Generates initial private tasks for a list of players.
 * Ensures every developer receives unique tasks and isolates their code buffers.
 * Does NOT expose solutionCode to client task representations.
 */
export function assignPrivateTasksToPlayers(
  playerIds: string[],
  existingMap: Record<string, PrivatePlayerTask[]> = {}
): Record<string, PrivatePlayerTask[]> {
  const result: Record<string, PrivatePlayerTask[]> = { ...existingMap };

  // 5 distinct room task groups (Auth/Library, Utils/Storage, Database/Medbay, Payment/DevLab, App/Command)
  const roomGroups: TaskSectionDefinition[][] = [
    TASK_SECTIONS.filter((t) => t.fileId === 'file-auth'),
    TASK_SECTIONS.filter((t) => t.fileId === 'file-utils'),
    TASK_SECTIONS.filter((t) => t.fileId === 'file-database'),
    TASK_SECTIONS.filter((t) => t.fileId === 'file-payment'),
    TASK_SECTIONS.filter((t) => t.fileId === 'file-app'),
  ];

  playerIds.forEach((playerId, index) => {
    if (!result[playerId]) {
      result[playerId] = [];
    }

    // Assign exactly 1 task per room to each player (alternating variants across players)
    roomGroups.forEach((group) => {
      if (group.length === 0) return;
      const section = group[index % group.length];
      if (!result[playerId].some((t) => t.fileId === section.fileId)) {
        result[playerId].push({
          taskId: section.id,
          assignedPlayerId: playerId,
          fileId: section.fileId,
          fileName: section.fileName,
          roomId: section.roomId,
          roomLabel: section.roomLabel,
          title: section.title,
          description: section.description,
          sectionCode: section.initialCode,
          baselineCode: section.initialCode,
          status: 'ASSIGNED',
          testKey: section.testKey,
          hint: section.hint,
        });
      }
    });
  });

  return result;
}

/**
 * Authoritative Server/Service-Level Task Fetcher:
 * Returns ONLY the tasks authorized for the requesting player.
 * If an unauthorized client attempts to request another player's tasks, access is strictly rejected.
 */
export function fetchAuthorizedPlayerTasks(
  requestingPlayerId: string,
  targetPlayerId: string,
  allPlayerIds: string[]
): { success: boolean; tasks: PrivatePlayerTask[]; error?: string; status: number } {
  // Security Authorization Guard: Reject unauthorized task reading
  if (requestingPlayerId !== targetPlayerId) {
    return {
      success: false,
      tasks: [],
      error: `403 Forbidden: Player "${requestingPlayerId}" is not authorized to read private tasks for Player "${targetPlayerId}".`,
      status: 403,
    };
  }

  const allAssignments = assignPrivateTasksToPlayers(allPlayerIds);
  const playerTasks = allAssignments[targetPlayerId] || [];

  return {
    success: true,
    tasks: playerTasks,
    status: 200,
  };
}

/**
 * Authoritative Task Modification Authorization Guard:
 * Prevents unauthorized clients from modifying another player's task state.
 */
export function validateTaskModification(
  requestingPlayerId: string,
  taskOwnerPlayerId: string
): { authorized: boolean; error?: string; status: number } {
  if (requestingPlayerId !== taskOwnerPlayerId) {
    return {
      authorized: false,
      error: `403 Forbidden: Player "${requestingPlayerId}" is not authorized to update tasks owned by Player "${taskOwnerPlayerId}".`,
      status: 403,
    };
  }
  return { authorized: true, status: 200 };
}

/**
 * Safely retrieves ONLY the private task assigned to the specified player for a room.
 * Resolves both MapData room IDs, room display names, and file mappings.
 * Returns NULL if the player has no task in this room.
 */
export function getPlayerTaskInRoom(
  playerTasks: PrivatePlayerTask[] | undefined,
  playerId: string,
  roomId: string
): PrivatePlayerTask | null {
  if (!playerTasks || playerTasks.length === 0) return null;

  const mapping = getRoomMapping(roomId);
  const targetFileId = mapping?.fileId;
  const targetTaskId = mapping?.taskId;
  const norm = roomId.toLowerCase().replace(/\s+/g, '_');

  const task = playerTasks.find((t) => {
    if (t.assignedPlayerId !== playerId) return false;
    // 1. Direct file match via roomMapping (e.g. 'file-auth' for Library)
    if (targetFileId && t.fileId === targetFileId) return true;
    // 2. Task ID match
    if (targetTaskId && (t.taskId === targetTaskId || t.taskId.startsWith(targetTaskId))) return true;
    // 3. Direct room ID or display name match
    if (t.roomId === norm || t.roomLabel.toLowerCase() === roomId.toLowerCase()) return true;
    return false;
  });

  return task || null;
}

/**
 * Validates a private task's section code using deterministic rules.
 */
export function validatePrivateTaskCode(taskId: string, code: string): TestResult[] {
  const def = getTaskSectionDefinition(taskId);
  if (def) {
    return def.validator(code);
  }

  // Check if taskId belongs to any bug in the 10 prebuilt challenges
  for (const challenge of PREBUILT_CHALLENGES) {
    const bug = challenge.bugs.find((b) => b.bugId === taskId);
    if (bug) {
      return bug.validator(code);
    }
  }

  return [
    {
      testId: 'unknown-task',
      taskId,
      fileId: 'unknown',
      name: 'Unknown task validation',
      passed: false,
      message: `Task ${taskId} has no validator.`,
    },
  ];
}

