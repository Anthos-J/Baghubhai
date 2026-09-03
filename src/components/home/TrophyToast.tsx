import React, { useEffect, useState } from 'react';
import { subscribeTrophyUnlock, TrophyDefinition } from '../../lib/trophies';
import { Trophy, CheckCircle2 } from 'lucide-react';

export const TrophyToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<TrophyDefinition | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTrophyUnlock((trophy) => {
      setActiveToast(trophy);
      setTimeout(() => {
        setActiveToast((current) => (current?.id === trophy.id ? null : current));
      }, 4000);
    });

    return () => unsubscribe();
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in pointer-events-none">
      <div className="bg-[#0e1626] border-2 border-primary/80 rounded-lg p-4 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-4 max-w-sm">
        <div className="text-3xl p-2 bg-primary/10 border border-primary/40 rounded-lg flex items-center justify-center">
          {activeToast.icon || '🏆'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-primary text-[10px] font-pixel tracking-wider">
            <Trophy size={12} /> ACHIEVEMENT UNLOCKED!
          </div>
          <div className="font-tech font-bold text-white text-base truncate">
            {activeToast.title}
          </div>
          <div className="text-gray-300 font-mono text-xs">
            {activeToast.description}
          </div>
        </div>
      </div>
    </div>
  );
};
