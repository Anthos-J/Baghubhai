import { AlertTriangle, Flame } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export default function AlarmOverlay() {
  const alarmActive = useMockStore((s) => s.alarmActive);
  const alarmMessage = useMockStore((s) => s.alarmMessage);
  const alarmRoomName = useMockStore((s) => s.alarmRoomName);

  if (!alarmActive) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none overflow-hidden animate-in fade-in duration-300">
      {/* ── Translucent Red-Yellow Warning Ambient Lighting ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF003C]/20 via-[#FFB800]/15 to-transparent animate-pulse pointer-events-none" />

      {/* ── Red-Yellow Flash Strobe Vignette ── */}
      <div className="absolute inset-0 border-[16px] border-[#FF003C]/40 shadow-[inset_0_0_80px_rgba(255,184,0,0.5)] animate-pulse pointer-events-none" />

      {/* ── Hazard Stripes Bar Top ── */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_24px,#FFB800_24px,#FFB800_48px)] shadow-[0_0_25px_#FF003C] opacity-90" />

      {/* ── Hazard Stripes Bar Bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_24px,#FFB800_24px,#FFB800_48px)] shadow-[0_0_25px_#FF003C] opacity-90" />

      {/* ── Central Floating Alarm Banner ── */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 flex items-center justify-center max-w-xl w-full px-4">
        <div className="w-full bg-black/90 border-2 border-[#FF003C] p-3 sm:p-4 shadow-[0_0_40px_rgba(255,0,60,0.7)] backdrop-blur-md flex items-center justify-between gap-3 text-white rounded-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF003C]/20 border border-[#FF003C] flex items-center justify-center text-[#FF003C] flex-shrink-0 animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs sm:text-sm text-[#FF003C] tracking-wider uppercase font-bold flex items-center gap-1">
                  <Flame size={14} className="text-[#FFB800] animate-pulse" /> RED-YELLOW ALARM
                </span>
                {alarmRoomName && (
                  <span className="font-mono text-[10px] bg-[#FF003C] text-white px-2 py-0.5 font-bold uppercase rounded-xs">
                    LOCATION: {alarmRoomName}
                  </span>
                )}
              </div>
              <p className="font-tech text-xs text-gray-200 mt-0.5 leading-snug">
                {alarmMessage || 'Codebase defect detected! One or more modules have been corrupted.'}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="font-mono text-[10px] text-yellow-400 font-bold uppercase tracking-widest animate-pulse block">
              FIX TERMINAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
