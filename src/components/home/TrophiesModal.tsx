import React, { useState, useEffect } from 'react';
import {
  TrophyCategory,
  TROPHY_DEFINITIONS,
  getTrophyStates,
  TrophyState,
} from '../../lib/trophies';
import { Trophy, X, Users, ShieldAlert, Megaphone, Gamepad2, Lock, CheckCircle2, Clock } from 'lucide-react';

interface TrophiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrophiesModal: React.FC<TrophiesModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<TrophyCategory | 'ALL'>('ALL');
  const [trophyStates, setTrophyStates] = useState<Record<string, TrophyState>>({});

  useEffect(() => {
    if (isOpen) {
      setTrophyStates(getTrophyStates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAchievements = TROPHY_DEFINITIONS.length;
  const unlockedCount = Object.values(trophyStates).filter((s) => s.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const filteredTrophies =
    activeCategory === 'ALL'
      ? TROPHY_DEFINITIONS
      : TROPHY_DEFINITIONS.filter((t) => t.category === activeCategory);

  const getCategoryIcon = (cat: TrophyCategory) => {
    switch (cat) {
      case 'DEVELOPER':
        return <Users className="w-3.5 h-3.5" />;
      case 'MAFIA':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'MEETING':
        return <Megaphone className="w-3.5 h-3.5" />;
      case 'GENERAL':
        return <Gamepad2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-panel/95 border-2 border-primary/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panelBorder flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Trophy className="w-5 h-5 text-warning animate-bounce-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech tracking-wider text-white flex items-center gap-2">
                TROPHIES & ACHIEVEMENTS
              </h2>
              <p className="text-xs text-textMuted font-mono">
                COMPLETED: {unlockedCount} / {totalAchievements} ({completionPercentage}%)
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

        {/* Global Progress Bar */}
        <div className="w-full bg-black/50 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-warning h-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex border-b border-panelBorder bg-black/30 px-4 pt-2 gap-1.5 font-tech text-xs overflow-x-auto">
          {(['ALL', 'DEVELOPER', 'MAFIA', 'MEETING', 'GENERAL'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {cat !== 'ALL' && getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>

        {/* Trophy Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTrophies.map((trophy) => {
              const state = trophyStates[trophy.id] || { progress: 0, unlocked: false };
              const isUnlocked = state.unlocked;
              const hasProgress = state.progress > 0 && !isUnlocked;

              return (
                <div
                  key={trophy.id}
                  className={`p-3 rounded-lg border transition-all flex gap-3 relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-primary/5 border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : hasProgress
                      ? 'bg-black/40 border-amber-500/40'
                      : 'bg-black/30 border-panelBorder opacity-60'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`text-2xl p-2 rounded-lg flex items-center justify-center h-12 w-12 border ${
                      isUnlocked
                        ? 'bg-primary/20 border-primary/40'
                        : 'bg-black/50 border-panelBorder grayscale'
                    }`}
                  >
                    {trophy.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-tech font-bold text-white text-sm truncate">
                          {trophy.title}
                        </span>
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
                            <CheckCircle2 size={12} /> UNLOCKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-[10px]">
                            <Lock size={12} />
                            {trophy.maxProgress > 1 ? `${state.progress}/${trophy.maxProgress}` : 'LOCKED'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-300 font-mono mt-0.5 leading-snug">
                        {trophy.description}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    {trophy.maxProgress > 1 && !isUnlocked && (
                      <div className="mt-2 w-full bg-black/60 h-1 rounded overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{
                            width: `${Math.round((state.progress / trophy.maxProgress) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-panelBorder flex justify-end items-center bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-black font-tech font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
