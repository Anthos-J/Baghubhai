import React from 'react';
import { GameButton } from '../components/ui/GameButton';

export default function Result() {
  const winner = 'developers' as 'developers' | 'mafia';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black text-textMain z-10">
      <div className="absolute inset-0 scanlines z-50"></div>
      
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-30 pointer-events-none ${winner === 'mafia' ? 'bg-mafia' : 'bg-primary'}`}></div>

      <div className="text-center z-10">
        <h2 className="font-tech text-gray-400 tracking-[0.5em] mb-4">GAME OVER</h2>
        <h1 className={`font-pixel text-5xl md:text-7xl ${winner === 'mafia' ? 'text-mafia drop-shadow-[0_0_30px_#FF003C]' : 'text-primary drop-shadow-[0_0_30px_#00F0FF]'}`}>
          {winner === 'mafia' ? 'MAFIA WINS' : 'DEVELOPERS WIN'}
        </h1>
        <p className="font-mono mt-6 text-xl text-white">
          {winner === 'mafia' ? 'The project failed to deploy.' : 'All bugs were fixed. Deployment successful.'}
        </p>
      </div>

      <div className="mt-16 z-10 flex gap-4">
        <GameButton variant={winner === 'mafia' ? 'danger' : 'primary'}>PLAY AGAIN</GameButton>
        <GameButton variant="ghost">BACK TO MENU</GameButton>
      </div>
    </div>
  );
}
