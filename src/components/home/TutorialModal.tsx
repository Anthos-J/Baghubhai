import React, { useEffect, useState } from 'react';
import { BookOpen, X, Users, ShieldAlert, CheckSquare, Terminal, Megaphone, ArrowRight, AlertTriangle, ShieldCheck, Flame, Compass } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TutorialTab = 'OVERVIEW' | 'STEPS' | 'ROLES' | 'CONTROLS' | 'FLOW';

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TutorialTab>('OVERVIEW');

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-panel/95 border-2 border-primary/50 rounded-xl shadow-[0_0_35px_rgba(0,240,255,0.25)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panelBorder flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech tracking-wider text-white flex items-center gap-2">
                AMONGDEVS TUTORIAL
              </h2>
              <p className="text-xs text-textMuted font-mono">
                FACILITY PROTOCOL & SURVIVAL GUIDE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-textMuted hover:text-white transition-colors cursor-pointer"
            title="Close [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-panelBorder bg-black/30 px-4 pt-2 gap-1.5 font-tech text-xs overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'WELCOME' },
            { id: 'STEPS', label: 'HOW TO PLAY' },
            { id: 'ROLES', label: 'ROLES' },
            { id: 'CONTROLS', label: 'CONTROLS' },
            { id: 'FLOW', label: 'GAME FLOW' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TutorialTab)}
              className={`px-3 py-1.5 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4 font-tech">
              <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
                <h3 className="text-primary font-bold text-base mb-1 font-pixel">
                  WELCOME TO AMONGDEVS
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-mono mt-2">
                  AmongDevs is a multiplayer social deduction game set in a mission-critical orbital facility. Crew members must cooperate to debug software modules and deploy systems before saboteurs compromise the facility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-black/40 border border-panelBorder rounded-lg">
                  <div className="text-primary font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={16} /> REPAIR & DEBUG
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Developers work at coding terminals to fix broken functions and push the deployment progress to 100%.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-mafia/40 rounded-lg">
                  <div className="text-mafia font-bold flex items-center gap-1.5 mb-1">
                    <Flame size={16} /> SABOTAGE & DECEIVE
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Mafia secretly injects bugs into completed tasks and triggers blackouts to halt deployment progress.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-panelBorder rounded-lg">
                  <div className="text-warning font-bold flex items-center gap-1.5 mb-1">
                    <Compass size={16} /> EXPLORE TERMINALS
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Move across room corridors using WASD and press [E] to access your authorized private code sections.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-panelBorder rounded-lg">
                  <div className="text-accent font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={16} /> WATCH REVERTED TASKS
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Tasks are not permanent: completed tasks can become compromised after Mafia sabotage and must be re-debugged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEPS */}
          {activeTab === 'STEPS' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-xs text-primary font-bold tracking-wider mb-1">
                10-STEP GAMEPLAY PROTOCOL:
              </div>
              <div className="space-y-2">
                {[
                  { step: '01', title: 'Navigate Facility', desc: 'Move around the orbital map using WASD or arrow keys.' },
                  { step: '02', title: 'Enter Coding Rooms', desc: 'Walk into any assigned lab and press [E] to open the workstation.' },
                  { step: '03', title: 'Open Private Task', desc: 'Read your unique authorized debugging task and description.' },
                  { step: '04', title: 'Inspect & Fix Code', desc: 'Identify the logic defect in the Monaco editor and write the correction.' },
                  { step: '05', title: 'Execute Test Suite', desc: 'Click RUN TESTS to execute deterministic lexical verification.' },
                  { step: '06', title: 'Advance Deployment', desc: 'Passing tasks increments global deployment progress towards 100%.' },
                  { step: '07', title: 'Detect Sabotage', desc: 'Watch for red-yellow alerts when Mafia corrupts solved code.' },
                  { step: '08', title: 'Emergency Meetings', desc: 'Hit [R] or interact with Emergency Terminal to summon players.' },
                  { step: '09', title: 'Discuss & Vote', desc: 'Debate evidence in chat, review code diffs, and vote out suspects.' },
                  { step: '10', title: 'Survive & Win', desc: 'Survive and fulfill your team win condition to claim victory!' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-3 p-2.5 bg-black/40 border border-panelBorder rounded-lg"
                  >
                    <span className="text-primary font-bold text-xs bg-primary/10 border border-primary/30 px-2 py-0.5 rounded font-mono">
                      {item.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-xs">{item.title}: </span>
                      <span className="text-gray-300 text-[11px] font-tech">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROLES */}
          {activeTab === 'ROLES' && (
            <div className="space-y-4 font-mono text-xs">
              {/* Developer */}
              <div className="p-4 bg-primary/5 border border-primary/40 rounded-lg">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <Users size={18} /> DEVELOPER (CREWMATE)
                </div>
                <ul className="space-y-1.5 text-gray-300 font-tech">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    Complete assigned debugging tasks across facility labs.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    Repair compromised tasks after Mafia sabotage.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    Discover suspicious player movements and code mutations.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    Participate in discussions and vote out suspected Mafia.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    <strong className="text-white">Win condition:</strong> Reach 100% deployment progress or eject all Mafia.
                  </li>
                </ul>
              </div>

              {/* Mafia */}
              <div className="p-4 bg-mafia/5 border border-mafia/40 rounded-lg">
                <div className="flex items-center gap-2 text-mafia font-bold text-sm mb-2">
                  <ShieldAlert size={18} /> MAFIA (IMPOSTOR)
                </div>
                <ul className="space-y-1.5 text-gray-300 font-tech">
                  <li className="flex items-center gap-2">
                    <span className="text-mafia font-bold">•</span>
                    Stay hidden among developers while faking task activity.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mafia font-bold">•</span>
                    Sabotage solved tasks and revert code into bugged states.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mafia font-bold">•</span>
                    Trigger syntax blackouts and room alarm disruptions.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mafia font-bold">•</span>
                    Deceive crew members during meetings to avoid elimination.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mafia font-bold">•</span>
                    <strong className="text-white">Win condition:</strong> Equalize or outnumber Developers or expire game timer.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLS */}
          {activeTab === 'CONTROLS' && (
            <div className="space-y-3 font-tech">
              <div className="text-xs text-primary font-bold tracking-wider mb-2 font-mono">
                ACTIVE INPUT CONTROLS:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">MOVE CHARACTER</div>
                    <div className="text-[11px] text-gray-400 font-mono">Navigate rooms and corridors</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-primary font-bold font-mono">
                    W A S D
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">INTERACT / TERMINAL</div>
                    <div className="text-[11px] text-gray-400 font-mono">Open workstation editor</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-primary font-bold font-mono">
                    E
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">EMERGENCY MEETING</div>
                    <div className="text-[11px] text-gray-400 font-mono">Call emergency alarm</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-accent font-bold font-mono">
                    R
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">CLOSE / BACK</div>
                    <div className="text-[11px] text-gray-400 font-mono">Exit terminal or modal</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-gray-300 font-bold font-mono">
                    ESC
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center sm:col-span-2">
                  <div>
                    <div className="font-bold text-white text-sm">FACILITY MAP</div>
                    <div className="text-[11px] text-gray-400 font-mono">Toggle live radar minimap</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-primary font-bold font-mono">
                    M
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GAME FLOW */}
          {activeTab === 'FLOW' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-xs text-primary font-bold tracking-wider mb-2">
                CORE GAMEPLAY LIFECYCLE:
              </div>
              <div className="p-3 bg-black/40 border border-primary/30 rounded-lg text-center font-bold text-xs text-primary tracking-wide">
                MAP ➔ ROOM ➔ CODE ➔ TEST ➔ COMPLETE ➔ DISCOVER ➔ EMERGENCY MEETING ➔ DISCUSS ➔ VOTE ➔ ELIMINATE ➔ WIN/LOSE
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {[
                  { step: 'MAP & ROAM', detail: 'Spawn into station and find your assigned coding workstation.' },
                  { step: 'OPEN TERMINAL', detail: 'Press [E] to access scoped private code buffers.' },
                  { step: 'RUN TESTS', detail: 'Execute deterministic checks to validate code logic.' },
                  { step: 'MAFIA REVERT', detail: 'Saboteurs re-introduce bugs to set tasks back to COMPROMISED.' },
                  { step: 'MEETING & VOTE', detail: 'Analyze evidence diffs, debate in chat, and eject suspects.' },
                  { step: 'VICTORY STATE', detail: 'Reaching 100% deployment or eliminating all Mafia wins the game.' },
                ].map((f, i) => (
                  <div key={i} className="p-2.5 bg-black/30 border border-panelBorder rounded flex flex-col gap-1">
                    <span className="text-primary font-bold">{f.step}</span>
                    <span className="text-gray-400 font-tech text-[11px]">{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-panelBorder flex justify-between items-center bg-black/40 font-mono text-xs">
          <span className="text-gray-400 text-[11px]">
            Press <span className="text-primary font-bold">[ESC]</span> to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-black font-tech font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
