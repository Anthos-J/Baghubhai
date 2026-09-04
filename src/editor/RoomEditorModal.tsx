/**
 * RoomEditorModal.tsx — P2.3 & Final Private Task Isolation Editor
 *
 * Self-contained modal overlay opened when a player presses [E] inside a coding room.
 * Mounts on top of the 2D Canvas (does NOT navigate to a new route).
 *
 * Private Task Isolation Features:
 *  - Loads ONLY the player's private assigned task and code section
 *  - Renders task title, description, hint, and lifecycle status badge
 *  - Displays anonymous presence counter (strictly count only, no identities)
 *  - Deterministic lexical validation (zero eval / zero arbitrary execution)
 *  - Read-only enforcement for eliminated ghosts
 */

import { useState, useCallback, useEffect } from 'react';
import { X, Play, CheckCircle, XCircle, LogOut, Terminal, ShieldAlert, AlertTriangle, Users, Globe, Lock, Code2 } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { FileTree } from './FileTree';
import { getInitialProjectFiles, EditorFile } from './predefinedProject';
import { runTaskTests, TestResult } from './testRunner';
import { getRoomMapping } from './roomMapping';
import { PrivatePlayerTask, PublicProjectContext, PUBLIC_PROJECT_CONTEXT, validatePrivateTaskCode } from './privateTasks';

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
   * Receives the taskId so the authoritative game engine records completion.
   */
  onTaskPassed?: (taskId: string, updatedCode?: string) => void;
  /**
   * When true, Monaco is read-only (Ghost / spectator mode).
   */
  readOnly?: boolean;
  /**
   * Optional: Public project metadata visible to all players.
   */
  publicProject?: PublicProjectContext;
  /**
   * Optional: Player's private assigned task for this room.
   * When provided, the editor operates in Private Task Isolation mode.
   */
  privateTask?: PrivatePlayerTask | null;
  /**
   * Optional: Anonymous count of other players currently at this terminal/file.
   * Strictly numerical count — zero player IDs or usernames exposed.
   */
  anonymousPresenceCount?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoomEditorModal({
  roomId,
  onClose,
  onTaskPassed,
  readOnly = false,
  publicProject = PUBLIC_PROJECT_CONTEXT,
  privateTask = null,
  anonymousPresenceCount = 0,
}: RoomEditorModalProps) {
  // ── Resolve mapping ──────────────────────────────────────────────────────
  const mapping = getRoomMapping(roomId);

  // ── Private Task Code State (or fallback projectFiles for legacy) ────────
  const [taskCode, setTaskCode] = useState<string>(() => {
    return privateTask?.sectionCode ?? '';
  });

  const [projectFiles, setProjectFiles] = useState<EditorFile[]>(() =>
    getInitialProjectFiles()
  );

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return mapping?.fileId ?? getInitialProjectFiles()[0]?.id ?? '';
  });

  // ── Test result state ────────────────────────────────────────────────────
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Synchronize when privateTask or roomId changes
  useEffect(() => {
    if (privateTask) {
      setTaskCode(privateTask.sectionCode);
    } else {
      const newMapping = getRoomMapping(roomId);
      setActiveFileId(newMapping?.fileId ?? getInitialProjectFiles()[0]?.id ?? '');
      setProjectFiles(getInitialProjectFiles());
    }
    setTestResults([]);
    setHasRun(false);
  }, [roomId, privateTask]);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeFile = projectFiles.find(f => f.id === activeFileId);
  const taskId = privateTask?.taskId ?? mapping?.taskId ?? null;
  const roomLabel = privateTask?.roomLabel ?? mapping?.roomLabel ?? roomId.toUpperCase();
  const allPassed = hasRun && testResults.length > 0 && testResults.every(r => r.passed);
  const taskStatus = privateTask?.status ?? (allPassed ? 'COMPLETED' : 'IN_PROGRESS');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue: string) => {
    if (privateTask) {
      setTaskCode(newValue);
    } else {
      setProjectFiles(prev =>
        prev.map(f => (f.id === activeFileId ? { ...f, content: newValue } : f))
      );
    }
    setHasRun(false);
    setTestResults([]);
  }, [privateTask, activeFileId]);

  const handleRunTests = useCallback(() => {
    if (!taskId) return;

    let results: TestResult[] = [];
    if (privateTask) {
      results = validatePrivateTaskCode(taskId, taskCode);
    } else {
      results = runTaskTests(projectFiles, taskId);
    }

    setTestResults(results);
    setHasRun(true);

    if (results.length > 0 && results.every(r => r.passed)) {
      onTaskPassed?.(taskId, privateTask ? taskCode : undefined);
    }
  }, [taskId, privateTask, taskCode, projectFiles, onTaskPassed]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Unknown room guard ───────────────────────────────────────────────────
  if (!mapping && !privateTask) {
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
                       hover:bg-primary hover:text-black transition-colors duration-150 cursor-pointer"
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
        {/* Left: room name + file name + presence */}
        <div className="flex items-center gap-4 min-w-0">
          <Terminal size={18} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-pixel text-primary text-xs tracking-widest truncate">
              {roomLabel}
            </div>
            <div className="font-mono text-[11px] text-gray-400 truncate">
              {privateTask ? privateTask.fileName : (activeFile?.name ?? '—')}
              {readOnly && (
                <span className="ml-2 text-mafia font-bold">[READ ONLY]</span>
              )}
            </div>
          </div>

          {/* Anonymous Presence Counter (Strictly anonymous — no usernames or IDs) */}
          {anonymousPresenceCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/40 text-warning font-mono text-[11px] rounded">
              <Users size={12} />
              <span>{anonymousPresenceCount} OTHER DEVELOPER{anonymousPresenceCount > 1 ? 'S' : ''} AT TERMINAL</span>
            </div>
          )}
        </div>

        {/* Right: Task status badge + Run Tests + Exit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Badge */}
          {privateTask && (
            <div className="font-mono text-xs px-2.5 py-1 border rounded">
              {taskStatus === 'COMPLETED' && (
                <span className="text-success border-success bg-success/10 px-2 py-0.5 font-bold">
                  ✓ COMPLETED
                </span>
              )}
              {taskStatus === 'COMPROMISED' && (
                <span className="text-mafia border-mafia bg-mafia/10 px-2 py-0.5 font-bold animate-pulse">
                  ⚠ COMPROMISED
                </span>
              )}
              {taskStatus === 'IN_PROGRESS' && (
                <span className="text-warning border-warning bg-warning/10 px-2 py-0.5">
                  IN PROGRESS
                </span>
              )}
              {taskStatus === 'ASSIGNED' && (
                <span className="text-primary border-primary bg-primary/10 px-2 py-0.5">
                  ASSIGNED
                </span>
              )}
            </div>
          )}

          {taskId && !readOnly && (
            <button
              id="run-tests-btn"
              onClick={handleRunTests}
              className="flex items-center gap-2 border-2 border-success text-success font-pixel
                         text-[10px] px-4 py-2 hover:bg-success hover:text-black
                         transition-colors duration-150 tracking-widest cursor-pointer"
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
                       transition-colors duration-150 tracking-widest cursor-pointer"
          >
            <LogOut size={12} />
            EXIT
          </button>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Body: Task Workspace ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Side: PUBLIC PROJECT CONTEXT + 🔒 YOUR PRIVATE TASK */}
        {privateTask ? (
          <aside className="flex-shrink-0 w-80 bg-[#0A0F1D] border-r-4 border-[#1A233A] p-3.5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3.5">
              {/* ── 1. PUBLIC PROJECT CONTEXT (Visible to everyone) ── */}
              <div className="bg-[#0D1426] border border-primary/30 p-2.5 rounded shadow-sm">
                <div className="flex items-center gap-1.5 text-primary font-pixel text-[10px] tracking-wider mb-1">
                  <Globe size={12} />
                  <span>PUBLIC PROJECT</span>
                </div>
                <div className="font-tech text-white font-bold text-xs">
                  {publicProject?.title ?? 'SPACE STATION CORE SERVICES'}
                </div>
                <p className="font-mono text-[10px] text-gray-400 mt-1 leading-relaxed">
                  {publicProject?.description}
                </p>
                <div className="mt-2 pt-1.5 border-t border-[#1A233A] text-[9px] font-mono text-warning leading-snug">
                  <span className="font-bold">OBJECTIVE:</span> {publicProject?.objective}
                </div>
              </div>

              {/* ── 2. 🔒 YOUR PRIVATE TASK (Visible ONLY to local player) ── */}
              <div className="bg-[#070B16] border-2 border-[#1A233A] p-2.5 rounded space-y-2">
                <div className="flex items-center gap-1.5 font-pixel text-[10px] text-primary tracking-widest border-b border-[#1A233A] pb-1.5">
                  <Lock size={12} className="text-primary" />
                  <span>YOUR PRIVATE TASK</span>
                </div>
                <div className="font-tech text-white font-bold text-xs leading-snug">
                  {privateTask.title}
                </div>
                <p className="font-mono text-[11px] text-gray-300 leading-relaxed">
                  {privateTask.description}
                </p>

                {privateTask.hint && (
                  <div className="p-2 bg-[#0D1426] border border-warning/40 rounded">
                    <div className="font-pixel text-[9px] text-warning mb-0.5">EXPECTED BEHAVIOR</div>
                    <div className="font-mono text-[10px] text-gray-300">{privateTask.hint}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1A233A] text-[9px] font-mono text-gray-500 flex items-center justify-between">
              <span>SECURE SCOPED WORKSPACE</span>
              <span className="text-success font-bold">ISOLATED</span>
            </div>
          </aside>
        ) : (
          <aside className="flex-shrink-0 w-44 border-r-4 border-[#1A233A] overflow-y-auto">
            <FileTree
              files={projectFiles}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              projectName="PROJECT SRC"
            />
          </aside>
        )}

        {/* Monaco editor panel: YOUR AUTHORIZED CODE SECTION */}
        <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
          {privateTask && (
            <div className="bg-[#0D1426] border-b border-[#1A233A] px-3 py-1 text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
              <Code2 size={12} className="text-primary" />
              <span>SHARED FACILITY CODEBASE // YOUR PRIVATE ROOM OBJECTIVE</span>
            </div>
          )}
          <CodeEditor
            key={privateTask ? privateTask.taskId : (activeFile?.id ?? 'editor')}
            value={privateTask ? taskCode : (activeFile?.content ?? '')}
            language={
              privateTask?.fileName?.endsWith('.java')
                ? 'java'
                : privateTask?.fileName?.endsWith('.py')
                ? 'python'
                : privateTask?.fileName?.endsWith('.c') || privateTask?.fileName?.endsWith('.cpp')
                ? 'cpp'
                : (activeFile?.language || 'javascript')
            }
            readOnly={readOnly}
            onChange={handleCodeChange}
            height="100%"
          />
        </div>
      </div>


      {/* ── Test Results panel ──────────────────────────────────────────── */}
      <footer className="flex-shrink-0 border-t-4 border-[#1A233A] bg-[#0D1426]
                         px-4 py-3 min-h-[85px] max-h-44 overflow-y-auto">
        {!hasRun && (
          <div className="font-mono text-xs text-gray-500 h-full flex items-center gap-2">
            <Terminal size={14} className="text-gray-600" />
            {taskStatus === 'COMPROMISED' ? (
              <span className="text-mafia font-bold animate-pulse flex items-center gap-1.5">
                <AlertTriangle size={14} />
                ⚠ CODE COMPROMISED — Your previously completed section requires investigation.
              </span>
            ) : taskStatus === 'COMPLETED' ? (
              <span className="text-success font-bold flex items-center gap-1.5">
                <CheckCircle size={14} />
                ✓ CODE SECTION COMPLETED — System stability restored.
              </span>
            ) : taskId ? (
              'Edit your assigned code section above, then click RUN TESTS.'
            ) : (
              'This room has no task associated.'
            )}
          </div>
        )}

        {hasRun && testResults.length === 0 && (
          <div className="font-mono text-xs text-warning">No tests returned.</div>
        )}

        {hasRun && testResults.length > 0 && (
          <div className="space-y-1.5">
            <div className={`font-pixel text-xs tracking-widest mb-2 ${allPassed ? 'text-success' : 'text-mafia'}`}>
              {allPassed ? '▶ ALL TESTS PASSED — TASK COMPLETE' : '▶ TEST FAILED — REVIEW CODE'}
            </div>

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

            {allPassed && (
              <div className="mt-2 font-pixel text-[10px] text-success border-2 border-success
                              inline-block px-3 py-1 shadow-[0_0_12px_rgba(0,255,0,0.4)]
                              animate-pulse">
                ✓ TASK COMPLETED — AUTHORITATIVE PROGRESS UPDATED
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default RoomEditorModal;

