/**
 * RoomEditorModal.tsx — P2.3 Room-to-Editor Integration
 *
 * Self-contained modal overlay opened when a player presses [E] inside a coding room.
 * Mounts on top of the 2D Canvas (does NOT navigate to a new route).
 * The underlying GameCanvas remains mounted and continues to render.
 *
 * Responsibilities (P2 only):
 *  - Resolve roomId → file via roomMapping
 *  - Load correct initial file from predefinedProject
 *  - Allow editing (alive) or read-only (ghost/spectator)
 *  - Run deterministic tests via testRunner (zero eval / zero exec)
 *  - Show per-test pass/fail results
 *  - Expose onTaskPassed callback for future P4/P3 integration
 *  - Provide EXIT TERMINAL button that calls onClose()
 *
 * Security: no eval(), no new Function(), no child_process, no iframe, no Web Workers.
 */

import { useState, useCallback, useEffect } from 'react';
import { X, Play, CheckCircle, XCircle, LogOut, Terminal, ShieldAlert } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { FileTree } from './FileTree';
import { getInitialProjectFiles, EditorFile } from './predefinedProject';
import { runTaskTests, TestResult } from './testRunner';
import { getRoomMapping } from './roomMapping';

// ---------------------------------------------------------------------------
// Public Props
// ---------------------------------------------------------------------------

export interface RoomEditorModalProps {
  /** The room identifier — accepts both MapData id ('auth_lab') and display name ('AUTH LAB') */
  roomId: string;
  /** Called when the player clicks EXIT TERMINAL */
  onClose: () => void;
  /**
   * Optional: called when all deterministic tests for the room's task pass.
   * Receives the taskId so the future game engine / backend can record completion.
   * P2 never acts as the authoritative game engine — this is purely informational.
   */
  onTaskPassed?: (taskId: string) => void;
  /**
   * When true, Monaco is read-only (Ghost / spectator mode).
   * Actual authorization is enforced by P3/P4; this is the UI restriction only.
   */
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoomEditorModal({
  roomId,
  onClose,
  onTaskPassed,
  readOnly = false,
}: RoomEditorModalProps) {
  // ── Resolve mapping ──────────────────────────────────────────────────────
  const mapping = getRoomMapping(roomId);

  // ── Editor file state (local, in-memory — P3 will eventually persist) ───
  const [projectFiles, setProjectFiles] = useState<EditorFile[]>(() =>
    getInitialProjectFiles()
  );

  // Active file defaults to the room's mapped file; falls back to first file
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return mapping?.fileId ?? getInitialProjectFiles()[0]?.id ?? '';
  });

  // ── Test result state ────────────────────────────────────────────────────
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // When roomId changes (modal re-used), reset active file to the new room's file
  useEffect(() => {
    const newMapping = getRoomMapping(roomId);
    setActiveFileId(newMapping?.fileId ?? getInitialProjectFiles()[0]?.id ?? '');
    setTestResults([]);
    setHasRun(false);
    setProjectFiles(getInitialProjectFiles());
  }, [roomId]);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeFile = projectFiles.find(f => f.id === activeFileId);
  const taskId = mapping?.taskId ?? null;
  const roomLabel = mapping?.roomLabel ?? roomId.toUpperCase();
  const allPassed = hasRun && testResults.length > 0 && testResults.every(r => r.passed);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue: string) => {
    setProjectFiles(prev =>
      prev.map(f => (f.id === activeFileId ? { ...f, content: newValue } : f))
    );
    // Clear previous results when code changes so the player must re-run
    setHasRun(false);
    setTestResults([]);
  }, [activeFileId]);

  const handleRunTests = useCallback(() => {
    if (!taskId) return;
    const results = runTaskTests(projectFiles, taskId);
    setTestResults(results);
    setHasRun(true);

    // Notify parent (game engine / backend stub) if all tests pass
    if (results.length > 0 && results.every(r => r.passed)) {
      onTaskPassed?.(taskId);
    }
  }, [projectFiles, taskId, onTaskPassed]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Unknown room guard ───────────────────────────────────────────────────
  if (!mapping) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-[#0D1426] border-4 border-mafia p-8 max-w-sm text-center shadow-[0_0_40px_rgba(255,0,60,0.4)]">
          <ShieldAlert size={40} className="text-mafia mx-auto mb-4 animate-pulse" />
          <div className="font-pixel text-mafia text-lg mb-2">TERMINAL ERROR</div>
          <div className="font-mono text-sm text-gray-400 mb-6">
            No coding terminal found for:<br />
            <span className="text-warning">{roomId}</span>
          </div>
          <button
            onClick={handleClose}
            className="w-full border-2 border-primary text-primary font-pixel text-sm px-6 py-3
                       hover:bg-primary hover:text-black transition-colors duration-150"
          >
            EXIT
          </button>
        </div>
      </div>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#070B16] border-4 border-primary
                    shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden">

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between
                         bg-[#0D1426] border-b-4 border-[#1A233A] px-4 py-2">
        {/* Left: room name + file name */}
        <div className="flex items-center gap-3 min-w-0">
          <Terminal size={18} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-pixel text-primary text-xs tracking-widest truncate">
              {roomLabel}
            </div>
            <div className="font-mono text-[11px] text-gray-500 truncate">
              {activeFile?.name ?? '—'}
              {readOnly && (
                <span className="ml-2 text-mafia">[READ ONLY]</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Run Tests + Exit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {taskId && !readOnly && (
            <button
              id="run-tests-btn"
              onClick={handleRunTests}
              className="flex items-center gap-2 border-2 border-success text-success font-pixel
                         text-[10px] px-4 py-2 hover:bg-success hover:text-black
                         transition-colors duration-150 tracking-widest"
            >
              <Play size={12} />
              RUN TESTS
            </button>
          )}
          <button
            id="exit-terminal-btn"
            onClick={handleClose}
            className="flex items-center gap-2 border-2 border-mafia text-mafia font-pixel
                       text-[10px] px-4 py-2 hover:bg-mafia hover:text-black
                       transition-colors duration-150 tracking-widest"
          >
            <LogOut size={12} />
            EXIT TERMINAL
          </button>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Body: FileTree + Editor ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar file tree */}
        <aside className="flex-shrink-0 w-44 border-r-4 border-[#1A233A] overflow-y-auto">
          <FileTree
            files={projectFiles}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            projectName="PROJECT SRC"
          />
        </aside>

        {/* Monaco editor panel */}
        <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
          {activeFile ? (
            <CodeEditor
              key={activeFile.id}
              value={activeFile.content}
              language={activeFile.language}
              readOnly={readOnly}
              onChange={handleCodeChange}
              height="100%"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#070B16]">
              <span className="font-mono text-gray-600 text-sm">
                No file selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Test Results panel ──────────────────────────────────────────── */}
      <footer className="flex-shrink-0 border-t-4 border-[#1A233A] bg-[#0D1426]
                         px-4 py-3 min-h-[80px] max-h-40 overflow-y-auto">
        {!hasRun && (
          <div className="font-mono text-xs text-gray-600 h-full flex items-center gap-2">
            <Terminal size={14} className="text-gray-700" />
            {taskId
              ? 'Press RUN TESTS to validate your fix...'
              : 'This room has no task associated.'}
          </div>
        )}

        {hasRun && testResults.length === 0 && (
          <div className="font-mono text-xs text-warning">No tests returned.</div>
        )}

        {hasRun && testResults.length > 0 && (
          <div className="space-y-1.5">
            {/* Summary line */}
            <div className={`font-pixel text-xs tracking-widest mb-2 ${allPassed ? 'text-success' : 'text-mafia'}`}>
              {allPassed ? '▶ ALL TESTS PASSED — TASK COMPLETE' : '▶ TEST FAILED — REVIEW CODE'}
            </div>

            {/* Per-test rows */}
            {testResults.map(result => (
              <div
                key={result.testId}
                className={`flex items-start gap-2 font-mono text-xs border-l-2 pl-3 py-0.5 ${
                  result.passed
                    ? 'border-success text-gray-300'
                    : 'border-mafia text-gray-400'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {result.passed
                    ? <CheckCircle size={12} className="text-success" />
                    : <XCircle size={12} className="text-mafia" />}
                </span>
                <span className="leading-relaxed">{result.message}</span>
              </div>
            ))}

            {/* Task complete badge */}
            {allPassed && (
              <div className="mt-2 font-pixel text-[10px] text-success border-2 border-success
                              inline-block px-3 py-1 shadow-[0_0_12px_rgba(0,255,0,0.4)]
                              animate-pulse">
                ✓ TASK COMPLETED — SYSTEM STABILITY RESTORED
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default RoomEditorModal;
