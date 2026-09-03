import { useEffect, useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';


export default function RoleReveal() {
  const { localPlayerState } = usePlayers();
  const role = localPlayerState?.role === 'MAFIA' ? 'mafia' : 'developer';
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative bg-black text-textMain z-10">
      
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none ${role === 'mafia' ? 'bg-mafia' : 'bg-primary'}`}></div>

      <div className="text-center z-10 animate-pulse">
        <h2 className="font-tech text-gray-400 tracking-[0.5em] mb-4">YOU ARE</h2>
        <h1 className={`font-pixel text-6xl md:text-8xl ${role === 'mafia' ? 'text-mafia drop-shadow-[0_0_20px_#FF003C]' : 'text-primary drop-shadow-[0_0_20px_#00F0FF]'}`}>
          {role === 'mafia' ? 'MAFIA' : 'DEVELOPER'}
        </h1>
      </div>

      <div className="mt-16 text-center max-w-lg z-10 border-4 border-panelBorder bg-panel/80 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {role === 'mafia' ? (
          <>
            <p className="font-tech text-xl text-white mb-4">Sabotage the project. Introduce bugs.</p>
            <p className="font-mono text-mafia uppercase tracking-wider text-sm">Do not let them deploy.</p>
          </>
        ) : (
          <>
            <p className="font-tech text-xl text-white mb-4">Fix the code. Complete your tasks.</p>
            <p className="font-mono text-primary uppercase tracking-wider text-sm">Deploy before it's too late.</p>
          </>
        )}
      </div>
      
      <div className="mt-12 font-mono text-gray-500 animate-bounce">
        GAME STARTING IN {countdown}...
      </div>
    </div>
  );
}
