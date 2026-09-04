import React, { useEffect } from 'react';
import { X, FileCode2, Terminal, ShieldAlert, Cpu, Layers, CheckCircle2, Bug, Sparkles, MapPin } from 'lucide-react';
import { CodeProject, DEFAULT_CODE_PROJECT } from '../../editor/codeProjects';
import { useMockStore } from '../../store/mockStore';

interface CodeBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: CodeProject | null;
}

export const CodeBriefModal: React.FC<CodeBriefModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const activeProject = project || DEFAULT_CODE_PROJECT;
  const myPrivateTasks = useMockStore((s) => s.myPrivateTasks);
  const localPlayer = useMockStore((s) => s.players.find((p) => p.id === s.session?.playerId));
  const isMafia = localPlayer?.role === 'MAFIA';

  // Handle ESC / H keys to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#070b13]/95 border-2 border-primary/50 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden rounded-md animate-in zoom-in-95 duration-200 text-textMain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Cyber Scanline & Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-panelBorder bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/10 border border-primary/40 text-primary shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <FileCode2 size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-primary tracking-widest uppercase">
                  ACTIVE CODE SPECIFICATION
                </span>
                <span className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[10px] font-mono border border-success/30 flex items-center gap-1">
                  <Sparkles size={10} /> RANDOMLY ASSIGNED
                </span>
              </div>
              <h2 className="font-mono text-sm text-gray-300 font-bold tracking-wider">
                {activeProject.codeName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer border border-transparent hover:border-panelBorder"
            title="Close [ESC / H]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-sm font-sans">
          
          {/* Main Codebase Info Banner */}
          <div className="p-4 rounded bg-gradient-to-br from-primary/10 via-black/40 to-transparent border border-primary/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-panelBorder/60">
              <div>
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
                  ASSIGNED CODEBASE PROJECT
                </span>
                <h3 className="font-tech text-2xl font-bold text-white tracking-wide">
                  {activeProject.name}
                </h3>
              </div>
              <div className="flex flex-col sm:items-end text-xs font-mono text-gray-400">
                <span className="text-secondary font-bold">{activeProject.category}</span>
                <span className="text-[10px] text-gray-500">{activeProject.securityLevel}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Cpu size={15} className="text-primary mt-0.5 shrink-0" />
                <p className="text-gray-300 font-mono leading-relaxed">
                  <span className="text-white font-bold">SYSTEM CLUSTER: </span>
                  {activeProject.system}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Terminal size={15} className="text-primary mt-0.5 shrink-0" />
                <p className="text-gray-300 leading-relaxed">
                  <span className="text-white font-bold font-mono">CODE BRIEF: </span>
                  {activeProject.brief}
                </p>
              </div>
            </div>
          </div>

          {/* Mission Objective Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Developer Directive */}
            <div className={`p-3.5 rounded border ${isMafia ? 'bg-black/40 border-panelBorder opacity-75' : 'bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 size={16} className="text-primary" />
                <span className="font-pixel text-xs text-primary">DEVELOPER OBJECTIVE</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {activeProject.objective}
              </p>
            </div>

            {/* Imposter / Mafia Directive */}
            <div className={`p-3.5 rounded border ${isMafia ? 'bg-[#FF003C]/10 border-[#FF003C]/50 shadow-[0_0_15px_rgba(255,0,60,0.15)]' : 'bg-black/40 border-panelBorder opacity-75'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Bug size={16} className="text-mafia" />
                <span className="font-pixel text-xs text-mafia">IMPOSTER DIRECTIVE</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Infiltrate the codebase. Introduce syntax traps and corrupt solved modules. Prevent team deployment before the global timer expires.
              </p>
            </div>
          </div>

          {/* Code Architecture & Modules Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-primary" />
                <h4 className="font-tech text-xs tracking-wider text-gray-300 uppercase font-bold">
                  FACILITY CODE ARCHITECTURE ({activeProject.modules.length} MODULES)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                INTERACT WITH TERMINALS TO REVIEW
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeProject.modules.map((mod) => (
                <div
                  key={mod.file}
                  className="p-3 bg-black/60 border border-panelBorder hover:border-primary/50 transition-colors rounded-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-panelBorder/50">
                      <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                        <FileCode2 size={13} className="text-primary/70 group-hover:text-primary" />
                        {mod.file}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-gray-300 text-[10px] font-tech border border-primary/20 flex items-center gap-1">
                        <MapPin size={10} className="text-warning" />
                        {mod.room}
                      </span>
                    </div>
                    <div className="font-tech text-[11px] text-white font-bold mb-1">
                      {mod.role}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Personal Assigned Task Callout (if active) */}
          {myPrivateTasks && myPrivateTasks.length > 0 && (
            <div className="p-3 bg-panel/70 border-2 border-warning/50 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-warning/20 text-warning border border-warning/40 shrink-0">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-warning uppercase font-bold tracking-wider">
                    YOUR ACTIVE CODE ASSIGNMENT
                  </div>
                  <div className="font-tech text-sm text-white font-bold">
                    {myPrivateTasks[0].title}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    File: <span className="text-primary">{myPrivateTasks[0].fileName}</span> • Terminal:{' '}
                    <span className="text-warning">{myPrivateTasks[0].roomLabel}</span>
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1 bg-black/80 border border-panelBorder rounded text-xs font-mono text-success self-stretch sm:self-auto text-center">
                STATUS: {myPrivateTasks[0].status}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-panelBorder bg-black/70 flex items-center justify-between text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 text-[10px]">H</span>
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 text-[10px]">ESC</span>
            <span>TOGGLE WINDOW</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-black font-tech font-bold tracking-wider rounded-xs border border-primary/50 transition-colors cursor-pointer"
          >
            CLOSE BRIEF
          </button>
        </div>
      </div>
    </div>
  );
};
