/**
 * problemDataset.ts
 *
 * Authoritative dataset of the 3 Big Java Projects with Intentional Bugs
 * from Code_Mafia_3_Big_Java_Projects_With_Bugs.md:
 * 1. Bank Management System (bank-management-system)
 * 2. Library Management System (library-management-system)
 * 3. Student Course & Result System (student-result-system)
 *
 * Each project contains 9 functional bugs divided among developers (3 bugs each for 3 devs).
 */

import { TestResult } from './testRunner';
import { BIG_JAVA_PROJECTS } from './bigJavaProjects';

export interface JavaBugDefinition {
  bugIndex: number; // 1 to 9
  id: string; // e.g. 'bank-management-system-bug-1'
  title: string;
  description: string;
  hint: string;
  buggyCode: string;
  solutionCode: string;
  validator: (code: string) => TestResult[];
}

export interface JavaProblem {
  id: string;
  title: string;
  description: string;
  correctCode: string;
  buggyFullCode: string;
  bugs: JavaBugDefinition[];
}

export const JAVA_PROBLEMS: JavaProblem[] = BIG_JAVA_PROJECTS;

export function getProblemById(id: string): JavaProblem {
  return JAVA_PROBLEMS.find((p) => p.id === id) || JAVA_PROBLEMS[0];
}

export function getRandomProblem(): JavaProblem {
  const index = Math.floor(Math.random() * JAVA_PROBLEMS.length);
  return JAVA_PROBLEMS[index];
}

// Find a bug definition across all problems by its taskId
export function findBugById(taskId: string): JavaBugDefinition | undefined {
  for (const problem of JAVA_PROBLEMS) {
    const found = problem.bugs.find((b) => b.id === taskId);
    if (found) return found;
  }
  return undefined;
}
