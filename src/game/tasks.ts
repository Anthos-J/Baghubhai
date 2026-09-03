import { TaskItem, TaskStatus } from '../types/game';

/**
 * Predefined project tasks aligned with Person 2 (Editor) specification.
 * Each task has initial flawed code, a correct solution, and an Imposter mutation.
 */
export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-auth',
    fileId: 'auth.js',
    fileName: 'auth.js',
    title: 'Fix Authentication Logic Bypass',
    description: 'The authentication function uses OR instead of AND, allowing unauthorized access.',
    status: 'PENDING',
    initialCode: `// Authentication module\nexport function authenticate(username, password) {\n  return username === "admin" || password === "admin123";\n}`,
    currentCode: `// Authentication module\nexport function authenticate(username, password) {\n  return username === "admin" || password === "admin123";\n}`,
    solutionCode: `// Authentication module\nexport function authenticate(username, password) {\n  return username === "admin" && password === "admin123";\n}`,
    mutatedBugCode: `// Authentication module\nexport function authenticate(username, password) {\n  return username === "admin" || password === "admin123";\n}`,
    testKey: 'test-auth',
    hint: 'Replace || with && to require both username and password.'
  },
  {
    id: 'task-utils',
    fileId: 'utils.js',
    fileName: 'utils.js',
    title: 'Sort Leaderboard Scores in Ascending Order',
    description: 'Utility function is sorting scores descending instead of ascending order.',
    status: 'PENDING',
    initialCode: `// Utility module\nexport function sortScores(scores) {\n  return [...scores].sort((a, b) => b - a);\n}`,
    currentCode: `// Utility module\nexport function sortScores(scores) {\n  return [...scores].sort((a, b) => b - a);\n}`,
    solutionCode: `// Utility module\nexport function sortScores(scores) {\n  return [...scores].sort((a, b) => a - b);\n}`,
    mutatedBugCode: `// Utility module\nexport function sortScores(scores) {\n  return [...scores].sort((a, b) => b - a);\n}`,
    testKey: 'test-utils',
    hint: 'Invert the comparator from (b - a) to (a - b).'
  },
  {
    id: 'task-database',
    fileId: 'database.js',
    fileName: 'database.js',
    title: 'Enable Database Connection Pool',
    description: 'connectDatabase currently hardcodes false, preventing DB connection.',
    status: 'PENDING',
    initialCode: `// Database connector\nexport function connectDatabase() {\n  return false;\n}`,
    currentCode: `// Database connector\nexport function connectDatabase() {\n  return false;\n}`,
    solutionCode: `// Database connector\nexport function connectDatabase() {\n  return true;\n}`,
    mutatedBugCode: `// Database connector\nexport function connectDatabase() {\n  return false;\n}`,
    testKey: 'test-database',
    hint: 'Return true upon successful connection.'
  },
  {
    id: 'task-payment',
    fileId: 'payment.js',
    fileName: 'payment.js',
    title: 'Validate Positive Payment Amounts',
    description: 'Zero amount transactions are currently accepted due to >= 0.',
    status: 'PENDING',
    initialCode: `// Payment processor\nexport function validateAmount(amount) {\n  return amount >= 0;\n}`,
    currentCode: `// Payment processor\nexport function validateAmount(amount) {\n  return amount >= 0;\n}`,
    solutionCode: `// Payment processor\nexport function validateAmount(amount) {\n  return amount > 0;\n}`,
    mutatedBugCode: `// Payment processor\nexport function validateAmount(amount) {\n  return amount <= 0;\n}`,
    testKey: 'test-payment',
    hint: 'Transactions must be strictly greater than 0 (> 0).'
  },
  {
    id: 'task-app',
    fileId: 'app.js',
    fileName: 'app.js',
    title: 'App Service Health Check',
    description: 'Ensure the application bootstrap status is set to READY.',
    status: 'PENDING',
    initialCode: `// Application bootstrap\nexport function getAppStatus() {\n  return "INITIALIZING";\n}`,
    currentCode: `// Application bootstrap\nexport function getAppStatus() {\n  return "INITIALIZING";\n}`,
    solutionCode: `// Application bootstrap\nexport function getAppStatus() {\n  return "READY";\n}`,
    mutatedBugCode: `// Application bootstrap\nexport function getAppStatus() {\n  return "CRASHED";\n}`,
    testKey: 'test-app',
    hint: 'Return "READY" when initialization completes.'
  }
];

/**
 * Returns fresh clones of default tasks.
 */
export function getDefaultTasks(): TaskItem[] {
  return JSON.parse(JSON.stringify(DEFAULT_TASKS));
}

/**
 * Calculates global progress percentage (0 - 100).
 * Only tasks with status 'COMPLETED' count toward progress.
 */
export function calculateProgress(tasks: TaskItem[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Deterministic test evaluator for a given task's code.
 */
export function evaluateTaskCode(taskId: string, code: string): boolean {
  if (!code) return false;
  const clean = code.replace(/\s+/g, ' ').trim();

  switch (taskId) {
    case 'task-auth':
      // Must contain && and not ||
      return clean.includes('username === "admin" && password === "admin123"');
    case 'task-utils':
      // Must sort ascending (a - b)
      return clean.includes('a - b');
    case 'task-database':
      // Must return true
      return clean.includes('return true');
    case 'task-payment':
      // Must strictly check > 0
      return clean.includes('amount > 0');
    case 'task-app':
      // Must return "READY"
      return clean.includes('return "READY"') || clean.includes("return 'READY'");
    default:
      return false;
  }
}

/**
 * Solves a task, sets status to COMPLETED, and updates the task code.
 */
export function solveTask(
  tasks: TaskItem[],
  taskId: string,
  resolvedCode?: string
): { tasks: TaskItem[]; progress: number; task: TaskItem | undefined } {
  let updatedTask: TaskItem | undefined;

  const nextTasks = tasks.map((t) => {
    if (t.id === taskId) {
      const currentCode = resolvedCode || t.solutionCode;
      updatedTask = {
        ...t,
        status: 'COMPLETED' as TaskStatus,
        currentCode,
      };
      return updatedTask;
    }
    return t;
  });

  const progress = calculateProgress(nextTasks);
  return { tasks: nextTasks, progress, task: updatedTask };
}

/**
 * Imposter action: bugs a task, resetting it or injecting mutated code.
 * Drops progress and marks task as BUGGED.
 */
export function bugTask(
  tasks: TaskItem[],
  taskId: string
): { tasks: TaskItem[]; progress: number; task: TaskItem | undefined } {
  let buggedTask: TaskItem | undefined;

  const nextTasks = tasks.map((t) => {
    if (t.id === taskId) {
      buggedTask = {
        ...t,
        status: 'BUGGED' as TaskStatus,
        currentCode: t.mutatedBugCode,
        lastBuggedAt: Date.now(),
      };
      return buggedTask;
    }
    return t;
  });

  const progress = calculateProgress(nextTasks);
  return { tasks: nextTasks, progress, task: buggedTask };
}

/**
 * Mystery mechanic for Developers:
 * When an imposter bugs a task, developers do NOT receive the exact task id.
 * Instead, bugged tasks are presented as needing verification/testing,
 * or with their specific bugged flag masked so the developer must test them.
 */
export function getDeveloperTaskView(tasks: TaskItem[]): TaskItem[] {
  return tasks.map((t) => {
    // If a task is BUGGED, to the developer it looks like it may require review/test
    // but does NOT explicitly highlight "THIS ONE WAS SABOTAGED".
    return {
      ...t,
      // For developer view, mask the explicit BUGGED tag so they must test/inspect files
      status: t.status === 'BUGGED' ? 'PENDING' : t.status,
    };
  });
}
