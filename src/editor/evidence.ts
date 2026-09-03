/**
 * evidence.ts — P2.4 Evidence & Diff System
 *
 * Provides deterministic, read-only diff calculations between the original
 * baseline project code (INITIAL_PROJECT_FILES) and current modified code.
 *
 * Used during emergency meetings and investigation phases to display evidence
 * of suspicious code changes and bug injections.
 *
 * STRICT SECURITY:
 * Pure string comparison only. Absolutely zero eval(), new Function(),
 * child_process, or arbitrary code execution.
 */

import { INITIAL_PROJECT_FILES, EditorFile } from './predefinedProject';

export interface FileEvidence {
  /** The unique file identifier (e.g. 'file-auth') */
  fileId: string;
  /** The filename (e.g. 'auth.js') */
  fileName: string;
  /** Language identifier for syntax highlighting (e.g. 'javascript') */
  language: string;
  /** Human-readable description of the module */
  description?: string;
  /** Associated task ID (e.g. 'task-auth') */
  taskId?: string;
  /** Original baseline content from INITIAL_PROJECT_FILES */
  baselineContent: string;
  /** Current content provided by caller / game state */
  currentContent: string;
  /** Whether currentContent differs from baselineContent */
  changed: boolean;
  /** Estimated count of added lines */
  addedLinesCount: number;
  /** Estimated count of removed lines */
  removedLinesCount: number;
}

/**
 * Calculates simple line-by-line additions and deletions between two text contents.
 */
function calculateLineStats(original: string, modified: string): { added: number; removed: number } {
  if (original === modified) {
    return { added: 0, removed: 0 };
  }

  const origLines = original.split(/\r?\n/);
  const modLines = modified.split(/\r?\n/);

  const origSet = new Set(origLines);
  const modSet = new Set(modLines);

  let added = 0;
  let removed = 0;

  for (const line of modLines) {
    if (!origSet.has(line)) added++;
  }

  for (const line of origLines) {
    if (!modSet.has(line)) removed++;
  }

  // Ensure at least 1 change is noted if strings differ but lines match set-wise
  if (added === 0 && removed === 0 && original !== modified) {
    added = 1;
    removed = 1;
  }

  return { added, removed };
}

/**
 * Returns diff evidence for a specific file by comparing current content with baseline.
 *
 * @param fileId Unique identifier for the file (e.g. 'file-auth')
 * @param currentContent The player's / project's current code string for this file
 * @returns FileEvidence object, or null if fileId is not recognized in baseline project
 */
export function getFileDiff(fileId: string, currentContent?: string): FileEvidence | null {
  const baselineFile = INITIAL_PROJECT_FILES.find(f => f.id === fileId);
  if (!baselineFile) {
    return null;
  }

  const effectiveCurrent = currentContent !== undefined && currentContent !== null ? currentContent : baselineFile.content;
  const changed = baselineFile.content !== effectiveCurrent;
  const stats = calculateLineStats(baselineFile.content, effectiveCurrent);

  return {
    fileId: baselineFile.id,
    fileName: baselineFile.name,
    language: baselineFile.language,
    description: baselineFile.description,
    taskId: baselineFile.taskId,
    baselineContent: baselineFile.content,
    currentContent: effectiveCurrent,
    changed,
    addedLinesCount: stats.added,
    removedLinesCount: stats.removed,
  };
}

/**
 * Generates evidence records for all predefined project files given a list of current files
 * or a dictionary mapping fileId -> currentContent.
 *
 * @param currentFiles Array of EditorFile objects or Record<fileId, contentString>
 * @returns Array of FileEvidence for all 5 baseline project files
 */
export function getAllFilesEvidence(
  currentFiles: EditorFile[] | Record<string, string>
): FileEvidence[] {
  const results: FileEvidence[] = [];

  const contentMap: Record<string, string> = {};
  if (Array.isArray(currentFiles)) {
    for (const file of currentFiles) {
      if (file && file.id) {
        contentMap[file.id] = file.content ?? '';
      }
    }
  } else if (currentFiles && typeof currentFiles === 'object') {
    Object.assign(contentMap, currentFiles);
  }

  for (const baseline of INITIAL_PROJECT_FILES) {
    const current = contentMap[baseline.id] !== undefined ? contentMap[baseline.id] : baseline.content;
    const evidence = getFileDiff(baseline.id, current);
    if (evidence) {
      results.push(evidence);
    }
  }

  return results;
}

/**
 * Convenience helper returning only the files that have been modified from baseline.
 */
export function getChangedFilesEvidence(
  currentFiles: EditorFile[] | Record<string, string>
): FileEvidence[] {
  return getAllFilesEvidence(currentFiles).filter(e => e.changed);
}
