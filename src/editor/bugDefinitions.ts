/**
 * Predefined bug definitions and mutations for AmongDevs.
 * Used by Person 4 (Game Engine) to apply deterministic sabotages/mutations
 * and by Person 2's test runner to validate fixes.
 */

import { EditorFile } from './predefinedProject';

export interface BugDefinition {
  id: string;
  taskId: string;
  fileId: string;
  name: string;
  description: string;
  buggyPattern: string;
  fixedPattern: string;
  mutation: (originalContent: string) => string;
}

export const KNOWN_BUGS: Record<string, BugDefinition> = {
  BUG_AUTH_01: {
    id: 'BUG_AUTH_01',
    taskId: 'task-auth',
    fileId: 'file-auth',
    name: 'Authentication Bypass',
    description: 'Login condition accepts either username OR password instead of requiring both.',
    buggyPattern: 'username === "admin" || password === "admin123"',
    fixedPattern: 'username === "admin" && password === "admin123"',
    mutation: (content: string) => {
      return content.replace(
        /username === "admin" && password === "admin123"/g,
        'username === "admin" || password === "admin123"'
      );
    }
  },
  BUG_UTILS_01: {
    id: 'BUG_UTILS_01',
    taskId: 'task-utils',
    fileId: 'file-utils',
    name: 'Reversed Score Sorting',
    description: 'Leaderboard score comparator sorts descending instead of ascending.',
    buggyPattern: 'b - a',
    fixedPattern: 'a - b',
    mutation: (content: string) => {
      return content.replace(/a - b/g, 'b - a');
    }
  },
  BUG_DATABASE_01: {
    id: 'BUG_DATABASE_01',
    taskId: 'task-database',
    fileId: 'file-database',
    name: 'Database Disconnect',
    description: 'connectDatabase() returns false causing all queries to fail.',
    buggyPattern: 'return false;',
    fixedPattern: 'return true;',
    mutation: (content: string) => {
      return content.replace(/return true;/g, 'return false;');
    }
  },
  BUG_PAYMENT_01: {
    id: 'BUG_PAYMENT_01',
    taskId: 'task-payment',
    fileId: 'file-payment',
    name: 'Zero-Amount Exploit',
    description: 'Transaction logic permits amount >= 0 instead of amount > 0.',
    buggyPattern: 'amount >= 0',
    fixedPattern: 'amount > 0',
    mutation: (content: string) => {
      return content.replace(/amount > 0/g, 'amount >= 0');
    }
  },
  BUG_APP_01: {
    id: 'BUG_APP_01',
    taskId: 'task-app',
    fileId: 'file-app',
    name: 'Production Ready Inversion',
    description: 'initializeApp disables ready flag when env is production.',
    buggyPattern: 'isProd ? false : true',
    fixedPattern: 'true',
    mutation: (content: string) => {
      return content.replace(/ready: true/g, 'ready: isProd ? false : true');
    }
  }
};

/**
 * Applies a predefined bug mutation to the specified file in the project.
 * Pure deterministic operation without arbitrary code generation.
 */
export function applyBugMutation(files: EditorFile[], bugId: string): EditorFile[] {
  const bug = KNOWN_BUGS[bugId];
  if (!bug) return files;

  return files.map(file => {
    if (file.id === bug.fileId) {
      return {
        ...file,
        content: bug.mutation(file.content)
      };
    }
    return file;
  });
}
