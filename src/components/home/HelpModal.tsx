import React, { useState } from 'react';
import { HelpCircle, X, Users, ShieldAlert, Megaphone, Ghost, Gamepad2, ArrowRight, GitCommit, CheckSquare, Terminal } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'HOW_TO_PLAY' | 'CONTROLS' | 'GAME_FLOW';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('HOW_TO_PLAY');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-panel/95 border-2 border-primary/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panelBorder flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech tracking-wider text-white flex items-center gap-2">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-textMuted font-mono">
                AMONGDEVS SURVIVAL & DEBUGGING MANUAL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-textMuted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-panelBorder bg-black/30 px-4 pt-2 gap-2 font-tech text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('HOW_TO_PLAY')}
            className={`px-4 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'HOW_TO_PLAY'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            HOW TO PLAY
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONTROLS')}
            className={`px-4 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'CONTROLS'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            CONTROLS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GAME_FLOW')}
            className={`px-4 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'GAME_FLOW'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            GAME FLOW
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm space-y-4">
          {/* TAB 1: HOW TO PLAY */}
          {activeTab === 'HOW_TO_PLAY' && (
            <div className="space-y-4">
              <div className="p-3 bg-black/40 border border-panelBorder rounded-lg">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Users className="w-4 h-4" /> DEVELOPERS (CREWMATES)
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-tech">
                  Work together to fix broken functions, validate logic bugs, and repair compromised code across the facility terminals. Complete all assigned tasks to trigger a successful deployment and win!
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-mafia/40 rounded-lg">
                <div className="flex items-center gap-2 text-mafia font-bold text-sm mb-1">
                  <ShieldAlert className="w-4 h-4" /> MAFIA (IMPOSTORS)
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-tech">
                  Infiltrate developer stations, inject critical bugs into solved tasks, trigger syntax blackouts, and deceive developers during meetings. Win by outnumbering developers or preventing deployment.
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-accent/40 rounded-lg">
                <div className="flex items-center gap-2 text-accent font-bold text-sm mb-1">
                  <Megaphone className="w-4 h-4" /> EMERGENCY MEETINGS & VOTING
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-tech">
                  Notice suspicious movement or code bugs? Hit the emergency button to call a meeting. Discuss theories in real-time chat, vote for suspects, and eliminate the Mafia!
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-purple-500/40 rounded-lg">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                  <Ghost className="w-4 h-4" /> GHOSTS & SPECTATORS
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-tech">
                  Eliminated players become ghosts. Ghosts cannot chat or vote during active meetings, but can freely roam the map and observe the action unfold.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS */}
          {activeTab === 'CONTROLS' && (
            <div className="space-y-3 font-tech">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="text-[11px] text-gray-400 font-mono">Open tasks at code stations</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-primary font-bold font-mono">
                    E
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">EMERGENCY MEETING</div>
                    <div className="text-[11px] text-gray-400 font-mono">Trigger emergency alarm</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-accent font-bold font-mono">
                    R
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">CLOSE / BACK</div>
                    <div className="text-[11px] text-gray-400 font-mono">Exit terminal or active modal</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-gray-300 font-bold font-mono">
                    ESC
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-panelBorder flex justify-between items-center sm:col-span-2">
                  <div>
                    <div className="font-bold text-white text-sm">MAP OVERVIEW</div>
                    <div className="text-[11px] text-gray-400 font-mono">View facility map & stations</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 border border-panelBorder rounded text-primary font-bold font-mono">
                    M
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GAME FLOW */}
          {activeTab === 'GAME_FLOW' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400 font-mono mb-2">
                CORE AMONGDEVS GAME LOOP:
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                {[
                  { step: '01', title: 'MAP & ROAM', desc: 'Spawn into station and find assigned workstations' },
                  { step: '02', title: 'ENTER TERMINAL', desc: 'Press [E] to open Monaco code editor' },
                  { step: '03', title: 'DEBUG CODE', desc: 'Identify bugs and execute test suite' },
                  { step: '04', title: 'COMPLETE TASK', desc: 'Progress global deployment meter toward 100%' },
                  { step: '05', title: 'SABOTAGE / DISCOVER', desc: 'Mafia injects bugs; alarms sound' },
                  { step: '06', title: 'EMERGENCY MEETING', desc: 'Gather all players to debate suspects' },
                  { step: '07', title: 'DISCUSSION & VOTE', desc: 'Cast votes or skip within allotted timer' },
                  { step: '08', title: 'ELIMINATION & WIN/LOSE', desc: 'Eject voted player & evaluate win conditions' },
                ].map((item, idx) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-3 p-2 bg-black/30 border border-panelBorder rounded-lg"
                  >
                    <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-gray-400 text-[11px] ml-2 font-tech">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-panelBorder flex justify-end items-center bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-black font-tech font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
