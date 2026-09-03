/**
 * Deterministic, Safe, and Hardened Test Runner for AmongDevs.
 * 
 * STRICT SECURITY NOTICE:
 * This test runner NEVER executes player-provided JavaScript.
 * NO eval(), NO new Function(), NO child_process, NO iframe, NO Web Workers.
 * Player code is treated strictly as static DATA and validated using
 * deterministic lexical tokenization, comment stripping, and structural rules.
 */

import { EditorFile } from './predefinedProject';

export interface TestResult {
  testId: string;
  taskId: string;
  fileId: string;
  name: string;
  passed: boolean;
  message: string;
}

export type TaskValidator = (source: string) => TestResult[];

/**
 * Deterministic Lexical Sanitizer:
 * 1. Strips all single-line (//) and multi-line (/* *\/) comments.
 * 2. Produces cleanCode (comments removed, strings preserved).
 * 3. Produces structureCode (comments removed, string literal contents masked).
 */
export function sanitizeSource(rawCode: string): {
  cleanCode: string;
  structureCode: string;
} {
  let cleanCode = '';
  let structureCode = '';
  
  let i = 0;
  const len = rawCode.length;

  while (i < len) {
    const char = rawCode[i];
    const nextChar = i + 1 < len ? rawCode[i + 1] : '';

    // Handle Single-Line Comments: // ...
    if (char === '/' && nextChar === '/') {
      i += 2;
      while (i < len && rawCode[i] !== '\n' && rawCode[i] !== '\r') {
        i++;
      }
      // Preserve newline to maintain line structure
      if (i < len) {
        cleanCode += rawCode[i];
        structureCode += rawCode[i];
        i++;
      }
      continue;
    }

    // Handle Multi-Line Block Comments: /* ... */
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < len && !(rawCode[i] === '*' && i + 1 < len && rawCode[i + 1] === '/')) {
        if (rawCode[i] === '\n') {
          cleanCode += '\n';
          structureCode += '\n';
        }
        i++;
      }
      i += 2; // Skip closing */
      continue;
    }

    // Handle String Literals: "...", '...', `...`
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      cleanCode += quote;
      structureCode += quote;
      i++;

      let stringContent = '';
      while (i < len) {
        const strChar = rawCode[i];
        if (strChar === '\\') {
          // Escaped character
          cleanCode += strChar;
          if (i + 1 < len) {
            cleanCode += rawCode[i + 1];
            i += 2;
          } else {
            i++;
          }
          continue;
        }

        if (strChar === quote) {
          cleanCode += quote;
          structureCode += quote; // string content inside quotes is stripped in structureCode
          i++;
          break;
        }

        stringContent += strChar;
        cleanCode += strChar;
        i++;
      }
      continue;
    }

    // Normal code character
    cleanCode += char;
    structureCode += char;
    i++;
  }

  return { cleanCode, structureCode };
}

/**
 * Normalizes code by compressing consecutive whitespace characters
 * into single spaces and trimming.
 */
export function normalizeWhitespace(code: string): string {
  return code.replace(/\s+/g, ' ').trim();
}

/**
 * Helper to safely extract a function body by name.
 */
function extractFunctionBody(code: string, functionName: string): string | null {
  const funcRegex = new RegExp(
    `(?:export\\s+)?(?:async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{` +
    `|` +
    `(?:export\\s+)?(?:const|let|var)\\s+${functionName}\\s*=\\s*(?:async\\s*)?(?:\\([^)]*\\)|[a-zA-Z0-9_$]+)\\s*=>\\s*\\{?`
  );

  const match = funcRegex.exec(code);
  if (!match) return null;

  const startIndex = match.index + match[0].length;
  // If it was an arrow function without braces
  if (!match[0].endsWith('{')) {
    const semicolonIndex = code.indexOf(';', startIndex);
    const newlineIndex = code.indexOf('\n', startIndex);
    let end = code.length;
    if (semicolonIndex !== -1 && semicolonIndex < end) end = semicolonIndex;
    if (newlineIndex !== -1 && newlineIndex < end) end = newlineIndex;
    return code.substring(startIndex, end);
  }

  // Bracket matching for braced bodies
  let depth = 1;
  let curr = startIndex;
  while (curr < code.length && depth > 0) {
    if (code[curr] === '{') depth++;
    else if (code[curr] === '}') depth--;
    curr++;
  }

  return code.substring(startIndex, curr - 1);
}

// =============================================================================
// TASK VALIDATORS
// =============================================================================

/**
 * VALIDATOR: task-auth (auth.js)
 * Expected:
 * - Credentials check requires BOTH username === "admin" AND password === "admin123"
 * - Does NOT allow OR (||) bypass
 */
export const validateAuthTask: TaskValidator = (source: string): TestResult[] => {
  const { cleanCode } = sanitizeSource(source);
  const normalizedClean = normalizeWhitespace(cleanCode);

  // 1. Check for illegal OR condition in authentication logic
  const hasOrCondition = /username\s*===\s*["']admin["']\s*\|\|\s*password\s*===\s*["']admin123["']/.test(normalizedClean) ||
    /password\s*===\s*["']admin123["']\s*\|\|\s*username\s*===\s*["']admin["']/.test(normalizedClean);

  // 2. Check for required AND condition
  const hasAndCondition = /username\s*===\s*["']admin["']\s*&&\s*password\s*===\s*["']admin123["']/.test(normalizedClean) ||
    /password\s*===\s*["']admin123["']\s*&&\s*username\s*===\s*["']admin["']/.test(normalizedClean);

  // 3. Ensure structure actually evaluates credentials (not a fake constant outside login)
  const loginBody = extractFunctionBody(cleanCode, 'login');
  const loginBodyHasAnd = loginBody ? (
    /username\s*===\s*["']admin["']\s*&&\s*password\s*===\s*["']admin123["']/.test(loginBody) ||
    /password\s*===\s*["']admin123["']\s*&&\s*username\s*===\s*["']admin["']/.test(loginBody)
  ) : false;

  const passed = hasAndCondition && !hasOrCondition && loginBodyHasAnd;

  return [
    {
      testId: 'test-auth-secure-credentials',
      taskId: 'task-auth',
      fileId: 'file-auth',
      name: 'Requires valid username AND password simultaneously',
      passed,
      message: passed
        ? 'Passed: Authentication logic requires both admin username and admin123 password.'
        : hasOrCondition
          ? 'Failed: Authentication vulnerability detected: logic permits login via OR (||) condition.'
          : !hasAndCondition
            ? 'Failed: Valid credentials check (username === "admin" && password === "admin123") missing.'
            : 'Failed: Credentials check must reside inside the login() function body.'
    }
  ];
};

/**
 * VALIDATOR: task-utils (utils.js)
 * Expected:
 * - sortScoresAscending must sort scores in ascending order (a - b)
 * - Must NOT sort descending (b - a)
 * - Supports variations: (a, b) => a - b, (a,b)=>a-b, (a, b) => { return a - b; }, function(a, b) { return a - b; }
 */
export const validateUtilsTask: TaskValidator = (source: string): TestResult[] => {
  const { cleanCode } = sanitizeSource(source);

  const utilsBody = extractFunctionBody(cleanCode, 'sortScoresAscending') || cleanCode;
  const normalizedBody = normalizeWhitespace(utilsBody);

  // Check for descending comparator: b - a
  const hasDescending =
    /\(\s*a\s*,\s*b\s*\)\s*=>\s*b\s*-\s*a/.test(normalizedBody) ||
    /\(\s*a\s*,\s*b\s*\)\s*=>\s*\{\s*return\s+b\s*-\s*a\s*;?\s*\}/.test(normalizedBody) ||
    /function\s*\(\s*a\s*,\s*b\s*\)\s*\{\s*return\s+b\s*-\s*a\s*;?\s*\}/.test(normalizedBody);

  // Check for ascending comparator: a - b
  const hasAscending =
    /\(\s*a\s*,\s*b\s*\)\s*=>\s*a\s*-\s*b/.test(normalizedBody) ||
    /\(\s*a\s*,\s*b\s*\)\s*=>\s*\{\s*return\s+a\s*-\s*b\s*;?\s*\}/.test(normalizedBody) ||
    /function\s*\(\s*a\s*,\s*b\s*\)\s*\{\s*return\s+a\s*-\s*b\s*;?\s*\}/.test(normalizedBody);

  const passed = hasAscending && !hasDescending;

  return [
    {
      testId: 'test-utils-sort-ascending',
      taskId: 'task-utils',
      fileId: 'file-utils',
      name: 'Leaderboard scores sorted in ascending order (a - b)',
      passed,
      message: passed
        ? 'Passed: Scores correctly sorted in ascending order using (a - b) comparator.'
        : hasDescending
          ? 'Failed: Array comparator is still sorting in descending order (b - a).'
          : 'Failed: Ascending comparator (a, b) => a - b not found in sortScoresAscending.'
    }
  ];
};

/**
 * VALIDATOR: task-database (database.js)
 * Expected:
 * - connectDatabase() must return true
 * - connectDatabase() must NOT return false
 */
export const validateDatabaseTask: TaskValidator = (source: string): TestResult[] => {
  const { cleanCode } = sanitizeSource(source);
  const dbBody = extractFunctionBody(cleanCode, 'connectDatabase');

  if (dbBody === null) {
    return [
      {
        testId: 'test-db-connection',
        taskId: 'task-database',
        fileId: 'file-database',
        name: 'connectDatabase() establishes connection',
        passed: false,
        message: 'Failed: connectDatabase function definition not found.'
      }
    ];
  }

  const normalizedBody = normalizeWhitespace(dbBody);

  // Check for return false
  const returnsFalse = /\breturn\s+false\b/.test(normalizedBody) || /^\s*false\b/.test(normalizedBody);
  // Check for return true
  const returnsTrue = /\breturn\s+true\b/.test(normalizedBody) || /^\s*true\b/.test(normalizedBody);

  const passed = returnsTrue && !returnsFalse;

  return [
    {
      testId: 'test-db-connection',
      taskId: 'task-database',
      fileId: 'file-database',
      name: 'connectDatabase() establishes connection successfully',
      passed,
      message: passed
        ? 'Passed: Database connection adapter returns true.'
        : returnsFalse
          ? 'Failed: connectDatabase() still returns false (connection failure).'
          : 'Failed: connectDatabase() must return true to establish connection.'
    }
  ];
};

/**
 * VALIDATOR: task-payment (payment.js)
 * Expected:
 * - processTransaction requires amount to be strictly positive (amount > 0)
 * - Rejects zero-amount / negative transactions (rejects amount >= 0)
 */
export const validatePaymentTask: TaskValidator = (source: string): TestResult[] => {
  const { structureCode } = sanitizeSource(source);
  const paymentBody = extractFunctionBody(structureCode, 'processTransaction') || structureCode;
  const normalizedBody = normalizeWhitespace(paymentBody);

  // Check if amount >= 0 or 0 <= amount is present in logic
  const hasZeroAllowed = /amount\s*>=\s*0/.test(normalizedBody) || /0\s*<=\s*amount/.test(normalizedBody);

  // Check if amount > 0 or 0 < amount is present in logic
  const hasStrictPositive = /amount\s*>\s*0/.test(normalizedBody) || /0\s*<\s*amount/.test(normalizedBody);

  const passed = hasStrictPositive && !hasZeroAllowed;

  return [
    {
      testId: 'test-payment-positive-amount',
      taskId: 'task-payment',
      fileId: 'file-payment',
      name: 'Transaction amount must be strictly positive (amount > 0)',
      passed,
      message: passed
        ? 'Passed: Transaction amount is strictly validated to be positive (amount > 0).'
        : hasZeroAllowed
          ? 'Failed: Zero-amount exploit detected: logic still permits amount >= 0.'
          : 'Failed: Strict positive transaction validation (amount > 0) missing.'
    }
  ];
};

/**
 * VALIDATOR: task-app (app.js)
 * Expected:
 * - Production configuration is not inverted (isProd ? false : true is fixed)
 * - ready status evaluates to true for production configuration
 */
export const validateAppTask: TaskValidator = (source: string): TestResult[] => {
  const { structureCode } = sanitizeSource(source);
  const appBody = extractFunctionBody(structureCode, 'initializeApp') || structureCode;
  const normalizedBody = normalizeWhitespace(appBody);

  // Check for buggy inversion patterns: isProd ? false : true or ready: !isProd
  const hasInversion =
    /isProd\s*\?\s*false\s*:\s*true/.test(normalizedBody) ||
    /ready\s*:\s*!isProd\b/.test(normalizedBody) ||
    /ready\s*:\s*isProd\s*===\s*false/.test(normalizedBody);

  const passed = !hasInversion;

  return [
    {
      testId: 'test-app-prod-ready',
      taskId: 'task-app',
      fileId: 'file-app',
      name: 'Application is marked ready in production mode',
      passed,
      message: passed
        ? 'Passed: Application initialization succeeds in production environment.'
        : 'Failed: Production ready status is inverted (isProd ? false : true).'
    }
  ];
};

// =============================================================================
// VALIDATOR REGISTRY & PUBLIC API
// =============================================================================

export const TASK_VALIDATORS: Record<string, { fileId: string; validator: TaskValidator }> = {
  'task-auth': { fileId: 'file-auth', validator: validateAuthTask },
  'task-utils': { fileId: 'file-utils', validator: validateUtilsTask },
  'task-database': { fileId: 'file-database', validator: validateDatabaseTask },
  'task-payment': { fileId: 'file-payment', validator: validatePaymentTask },
  'task-app': { fileId: 'file-app', validator: validateAppTask }
};

/**
 * Runs deterministic tests for a specific task.
 * Operates purely in memory. Safely handles unknown task IDs or missing files.
 */
export function runTaskTests(files: EditorFile[], taskId: string): TestResult[] {
  const taskConfig = TASK_VALIDATORS[taskId];

  if (!taskConfig) {
    return [
      {
        testId: `unknown-task-${taskId}`,
        taskId,
        fileId: 'unknown',
        name: `Task ${taskId}`,
        passed: false,
        message: `Unknown task ID "${taskId}". No validator registered.`
      }
    ];
  }

  const file = files.find(f => f.id === taskConfig.fileId);
  if (!file) {
    return [
      {
        testId: `missing-file-${taskConfig.fileId}`,
        taskId,
        fileId: taskConfig.fileId,
        name: `File check for ${taskConfig.fileId}`,
        passed: false,
        message: `Target file "${taskConfig.fileId}" was not found in project state.`
      }
    ];
  }

  return taskConfig.validator(file.content);
}

/**
 * Runs all test suites for all 5 predefined challenges.
 */
export function runAllTests(files: EditorFile[]): Record<string, TestResult[]> {
  const results: Record<string, TestResult[]> = {};
  for (const taskId of Object.keys(TASK_VALIDATORS)) {
    results[taskId] = runTaskTests(files, taskId);
  }
  return results;
}

/**
 * Returns true if all tests for the given task pass.
 */
export function isTaskPassed(files: EditorFile[], taskId: string): boolean {
  const results = runTaskTests(files, taskId);
  return results.length > 0 && results.every(r => r.passed);
}
