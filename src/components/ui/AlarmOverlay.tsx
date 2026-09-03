import React from 'react';
import { GameAlarm } from '../../types/game';
import { ShieldAlert, AlertTriangle, EyeOff } from 'lucide-react';

interface AlarmOverlayProps {
  alarm: GameAlarm | null;
  onDismiss?: () => void;
}

export const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ alarm, onDismiss }) => {
  if (!alarm || !alarm.isActive) return null;

  const isRedYellow = alarm.type === 'RED_YELLOW_ALERT';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-start pt-16">
      {/* Translucent Red & Yellow Alarm Lighting Effect across full screen */}
      <div 
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          isRedYellow 
            ? 'alarm-overlay-red-yellow pointer-events-none' 
            : 'bg-black/60 backdrop-blur-[2px]'
        }`} 
      />

      {/* High Alert Banner */}
      <div className="relative z-50 pointer-events-auto max-w-2xl w-full mx-4 px-6 py-4 bg-[#0B101E]/95 border-4 border-mafia shadow-[0_0_40px_rgba(255,0,60,0.6)] animate-bounce flex flex-col gap-2">
        <div className="flex items-center justify-between border-b-2 border-mafia/50 pb-2">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-mafia/20 border border-mafia text-mafia animate-pulse">
              <ShieldAlert size={24} />
            </span>
            <div>
              <div className="font-pixel text-xs text-warning tracking-widest uppercase">
                SECURITY COMPROMISED
              </div>
              <div className="font-pixel text-sm sm:text-base text-mafia drop-shadow-[0_0_10px_#FF003C]">
                SYSTEM ANOMALY DETECTED!
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-warning/20 border border-warning px-3 py-1 text-warning font-tech text-xs">
            <AlertTriangle size={14} className="animate-pulse" />
            <span>ALARM ACTIVE</span>
          </div>
        </div>

        <div className="font-tech text-gray-200 text-sm mt-1">
          {alarm.message}
        </div>

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-800 text-xs font-tech">
          <div className="flex items-center gap-2 text-warning">
            <EyeOff size={14} />
            <span>LOCATION UNKNOWN: Inspect modules &amp; run tests to find the bug!</span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1 bg-panel border-2 border-panelBorder hover:border-warning text-gray-300 hover:text-white transition-colors"
            >
              ACKNOWLEDGE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
