import { TerminalPanel } from '../components/ui/TerminalPanel';
import { GameButton } from '../components/ui/GameButton';
import { Activity, Code2, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';


export default function Game() {
  return (
    <div className="min-h-screen flex flex-col p-2 relative bg-background text-textMain overflow-hidden">
      
      {/* Top HUD */}
      <header className="flex justify-between items-center bg-panel border-4 border-panelBorder p-2 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="bg-black border-2 border-panelBorder p-2 text-primary font-mono text-lg font-bold flex gap-3 items-center">
            <Activity className="animate-pulse" />
            03:45
          </div>
          <div className="font-tech text-sm">
            <div className="text-gray-400">PROJECT STABILITY</div>
            <div className="w-48 h-4 bg-black border border-gray-700 mt-1 relative">
              <div className="absolute top-0 left-0 h-full bg-success w-[75%] shadow-[0_0_10px_#00FF66]"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <GameButton variant="danger" className="py-1 px-4 text-xs">EMERGENCY MEETING</GameButton>
          <div className="border-l-2 border-panelBorder pl-4 flex flex-col items-end justify-center">
            <StatusBadge status="developer" label="DEVELOPER" />
            <div className="font-tech text-xs mt-1 text-gray-400">Alex_Dev</div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex gap-2 mt-2 z-10 overflow-hidden">
        
        {/* Left Side: Tasks & System Log */}
        <aside className="w-[300px] flex flex-col gap-2 h-full">
          <div className="pixel-panel flex-1 flex flex-col">
            <div className="pixel-panel-header flex gap-2"><Code2 size={14} /> TASKS</div>
            <div className="p-3 flex-1 overflow-y-auto">
              <ul className="space-y-3 font-tech text-sm">
                <li className="flex items-center gap-2 text-success"><input type="checkbox" checked readOnly className="accent-success" /> Fix infinite loop in Auth</li>
                <li className="flex items-center gap-2 text-white"><input type="checkbox" readOnly /> Refactor Data Parser</li>
                <li className="flex items-center gap-2 text-gray-500"><input type="checkbox" readOnly /> Optimize Render Loop</li>
              </ul>
            </div>
          </div>
          
          <TerminalPanel className="h-[250px]">
            <div className="text-xs text-gray-500 mb-2">-- SYSTEM LOG --</div>
            <div className="text-green-500">&gt; build process started...</div>
            <div className="text-green-500">&gt; resolving dependencies...</div>
            <div className="text-warning">&gt; [WARN] Unused variable in auth.ts</div>
            <div className="text-mafia">&gt; [ERROR] Sabotage detected in Database!</div>
            <div className="mt-2 animate-pulse">_</div>
          </TerminalPanel>
        </aside>

        {/* Center: IDE / Editor */}
        <section className="flex-1 pixel-panel flex flex-col overflow-hidden">
          <div className="pixel-panel-header bg-[#1e1e1e] flex gap-4">
            <span className="text-gray-400 hover:text-white cursor-pointer bg-black px-3 py-1 border-b-2 border-primary">auth.ts</span>
            <span className="text-gray-400 hover:text-white cursor-pointer px-3 py-1">parser.ts</span>
            <span className="text-mafia flex items-center gap-1 cursor-pointer px-3 py-1 ml-auto"><ShieldAlert size={12}/> SABOTAGE ACTIVE</span>
          </div>
          <div className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm text-gray-300 overflow-y-auto relative border-t-2 border-black">
            {/* Fake Code Editor Content */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#141414] border-r border-[#2a2a2a] text-right pr-2 pt-4 text-gray-600 select-none">
              1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10
            </div>
            <pre className="ml-10">
<span className="text-purple-400">export function</span> <span className="text-blue-400">login</span>(user: <span className="text-yellow-400">User</span>) {'{'}
  <span className="text-gray-500">// TODO: Fix the authentication loop</span>
  <span className="text-purple-400">if</span> (!user.token) {'{'}
    <span className="text-purple-400">return</span> <span className="text-orange-400">false</span>;
  {'}'}
  
  <span className="text-purple-400">while</span> (<span className="text-orange-400">true</span>) {'{'} <span className="text-mafia bg-mafia/20 px-1">&lt;-- BUG</span>
    <span className="text-blue-400">checkCredentials</span>(user);
  {'}'}
  
  <span className="text-purple-400">return</span> <span className="text-orange-400">true</span>;
{'}'}
            </pre>
          </div>
        </section>

      </main>
    </div>
  );
}
