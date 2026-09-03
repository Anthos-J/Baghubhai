/**
 * EvidenceDiffModal.tsx — P2.4 Evidence & Diff System
 *
 * Self-contained, read-only evidence inspection modal.
 * Displays side-by-side Monaco diffs between the original baseline code and
 * current player-modified code.
 *
 * Designed for use in Emergency Meetings, post-game analysis, or inspection.
 *
 * STRICT SECURITY:
 * Purely read-only. Zero eval, zero code execution, zero user editing.
 */

import { useState, useMemo, useCallback } from 'react';
import { X, LogOut, FileCode, CheckCircle2, AlertTriangle, Shield, Search } from 'lucide-react';
import { DiffViewer } from './DiffViewer';
import { EditorFile, INITIAL_PROJECT_FILES } from './predefinedProject';
import { getAllFilesEvidence, getFileDiff, FileEvidence } from './evidence';

export interface EvidenceDiffModalProps {
  /** Initial or default file ID to inspect (e.g. 'file-auth') */
  initialFileId?: string;
  /** Current project files or content map to diff against baseline */
  files?: EditorFile[] | Record<string, string>;
  /** Direct single file evidence override if provided */
  evidence?: FileEvidence;
  /** Callback fired when the user closes the modal */
  onClose: () => void;
  /** Custom header title (default: 'EVIDENCE TERMINAL // CODE DIFF') */
  title?: string;
}

export function EvidenceDiffModal({
  initialFileId,
  files,
  evidence,
  onClose,
  title = 'EVIDENCE TERMINAL // CODE LOGS',
}: EvidenceDiffModalProps) {
  // ── Compute all file evidences from supplied files or default baseline ─────
  const allEvidences = useMemo<FileEvidence[]>(() => {
    if (evidence) {
      return [evidence];
    }
    if (files) {
      return getAllFilesEvidence(files);
    }
    // Default: compare baseline with baseline (all unchanged)
    return INITIAL_PROJECT_FILES.map(f => getFileDiff(f.id, f.content)!);
  }, [files, evidence]);

  // ── Active file selection state ──────────────────────────────────────────
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    if (initialFileId && allEvidences.some(e => e.fileId === initialFileId)) {
      return initialFileId;
    }
    // Default to first changed file, or the first file overall
    const firstChanged = allEvidences.find(e => e.changed);
    return firstChanged?.fileId ?? allEvidences[0]?.fileId ?? 'file-auth';
  });

  const activeEvidence = useMemo(() => {
    return allEvidences.find(e => e.fileId === activeFileId) ?? allEvidences[0] ?? null;
  }, [allEvidences, activeFileId]);

  const changedCount = useMemo(() => {
    return allEvidences.filter(e => e.changed).length;
  }, [allEvidences]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[85vh] flex flex-col bg-[#070B16] border-4 border-warning
                      shadow-[0_0_60px_rgba(255,184,0,0.25)] overflow-hidden">

        {/* ── Header bar ─────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 flex items-center justify-between
                           bg-[#0D1426] border-b-4 border-[#1A233A] px-4 py-2.5">
          {/* Left: Title + Active file status */}
          <div className="flex items-center gap-3 min-w-0">
            <Shield size={20} className="text-warning flex-shrink-0 animate-pulse" />
            <div className="min-w-0">
              <div className="font-pixel text-warning text-xs tracking-widest truncate">
                {title}
              </div>
              <div className="font-mono text-[11px] text-gray-400 flex items-center gap-2 truncate">
                <span>FILE: <strong className="text-white">{activeEvidence?.fileName ?? '—'}</strong></span>
                <span className="text-gray-600">|</span>
                {activeEvidence?.changed ? (
                  <span className="text-mafia font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    MODIFIED (+{activeEvidence.addedLinesCount} / -{activeEvidence.removedLinesCount} lines)
                  </span>
                ) : (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    ORIGINAL / UNCHANGED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Changed stats + Close Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-black/60 border border-[#1A233A] px-3 py-1 font-mono text-xs">
              <span className="text-gray-400">STATUS:</span>
              <span className={changedCount > 0 ? 'text-mafia font-bold' : 'text-success'}>
                {changedCount} / {allEvidences.length} FILES ALTERED
              </span>
            </div>

            <button
              onClick={handleClose}
              className="flex items-center gap-2 border-2 border-warning text-warning font-pixel
                         text-[10px] px-4 py-2 hover:bg-warning hover:text-black
                         transition-colors duration-150 tracking-widest"
            >
              <LogOut size={12} />
              EXIT EVIDENCE
            </button>

            <button
              onClick={handleClose}
              className="p-1 text-gray-500 hover:text-white transition-colors"
              aria-label="Close evidence modal"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ── Main Body: File Selector + Monaco DiffViewer ───────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Sidebar file list */}
          <aside className="flex-shrink-0 w-52 bg-[#070B16] border-r-4 border-[#1A233A] flex flex-col select-none overflow-y-auto">
            <div className="bg-[#0D1426] px-3 py-2 border-b-2 border-[#1A233A] flex items-center gap-2">
              <Search size={14} className="text-warning" />
              <span className="font-pixel text-[10px] text-warning tracking-wider uppercase">
                INSPECT FILES
              </span>
            </div>

            <div className="py-2 flex flex-col">
              {allEvidences.map((ev) => {
                const isActive = ev.fileId === activeFileId;
                return (
                  <button
                    key={ev.fileId}
                    onClick={() => setActiveFileId(ev.fileId)}
                    className={`w-full px-3 py-2.5 flex flex-col gap-1 text-left font-mono text-xs transition-colors border-l-4 ${
                      isActive
                        ? 'bg-warning/10 text-white border-warning font-bold shadow-[inset_0_0_10px_rgba(255,184,0,0.1)]'
                        : 'text-gray-400 hover:text-white hover:bg-[#111827] border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5 truncate">
                        <FileCode size={14} className={ev.changed ? 'text-mafia' : 'text-gray-500'} />
                        <span className="truncate">{ev.fileName}</span>
                      </span>
                      {ev.changed ? (
                        <span className="text-[9px] font-pixel text-mafia bg-mafia/20 border border-mafia px-1.5 py-0.5">
                          DIFF
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-gray-600">
                          OK
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <span className="text-[10px] text-gray-500 truncate w-full font-tech">
                        {ev.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Monaco DiffViewer Container */}
          <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
            {activeEvidence ? (
              <DiffViewer
                key={activeEvidence.fileId}
                original={activeEvidence.baselineContent}
                modified={activeEvidence.currentContent}
                language={activeEvidence.language}
                readOnly={true}
                originalTitle="ORIGINAL REPO BASELINE"
                modifiedTitle={`INSPECTED CODE [${activeEvidence.fileName}]`}
                height="100%"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#070B16]">
                <span className="font-mono text-gray-600 text-sm">
                  No evidence file selected
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer / Status Bar ────────────────────────────────────────── */}
        <footer className="flex-shrink-0 border-t-4 border-[#1A233A] bg-[#0D1426] px-4 py-2.5 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">ANALYSIS:</span>
            {activeEvidence?.changed ? (
              <span className="text-warning">
                ⚠️ Discrepancy detected against baseline. Review highlighted lines above.
              </span>
            ) : (
              <span className="text-success">
                ✓ No modifications detected. File content matches original repository baseline.
              </span>
            )}
          </div>

          <div className="hidden sm:block text-gray-500 font-tech text-xs">
            PRESS <kbd className="text-warning bg-black px-1.5 py-0.5 border border-[#333]">ESC</kbd> OR EXIT TERMINAL TO RETURN
          </div>
        </footer>
      </div>
    </div>
  );
}

export default EvidenceDiffModal;
