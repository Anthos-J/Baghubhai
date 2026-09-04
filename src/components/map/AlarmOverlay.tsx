import { AlertTriangle, Flame, Search } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export default function AlarmOverlay() {
  const alarmActive = useMockStore((s) => s.alarmActive);
  const alarmMessage = useMockStore((s) => s.alarmMessage);

  if (!alarmActive) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none overflow-hidden animate-in fade-in duration-300">
      <style>{`
        @keyframes redYellowAlarmBlink {
          0%, 100% {
            background-color: rgba(255, 0, 60, 0.22);
            box-shadow: inset 0 0 120px rgba(255, 0, 60, 0.65);
          }
          50% {
            background-color: rgba(255, 184, 0, 0.22);
            box-shadow: inset 0 0 120px rgba(255, 184, 0, 0.65);
          }
        }
        @keyframes hazardStripeMove {
          0% { background-position: 0 0; }
          100% { background-position: 48px 0; }
        }
      `}</style>

      {/* ── Dynamic Red & Yellow Translucent Blinking Ambient Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          animation: 'redYellowAlarmBlink 1.2s infinite ease-in-out',
        }}
      />

      {/* ── Red-Yellow Flash Strobe Vignette Border ── */}
      <div className="absolute inset-0 border-[14px] border-[#FF003C]/30 shadow-[inset_0_0_90px_rgba(255,184,0,0.5)] pointer-events-none" />

      {/* ── Animated Hazard Stripes Bar Top ── */}
      <div
        className="absolute top-0 left-0 right-0 h-4 sm:h-5 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_24px,#FFB800_24px,#FFB800_48px)] shadow-[0_0_25px_#FF003C] opacity-95"
        style={{
          backgroundSize: '48px 48px',
          animation: 'hazardStripeMove 2s linear infinite',
        }}
      />

      {/* ── Animated Hazard Stripes Bar Bottom ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 sm:h-5 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_24px,#FFB800_24px,#FFB800_48px)] shadow-[0_0_25px_#FF003C] opacity-95"
        style={{
          backgroundSize: '48px 48px',
          animation: 'hazardStripeMove 2s linear infinite',
        }}
      />

      {/* ── Central Floating Alarm Banner (Room/Code is anonymous to require manual room search) ── */}
      <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 flex items-center justify-center max-w-xl w-full px-4">
        <div className="w-full bg-black/95 border-2 border-[#FF003C] p-3 sm:p-4 shadow-[0_0_40px_rgba(255,0,60,0.7)] backdrop-blur-md flex items-center justify-between gap-3 text-white rounded-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF003C]/20 border border-[#FF003C] flex items-center justify-center text-[#FF003C] flex-shrink-0 animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs sm:text-sm text-[#FF003C] tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <Flame size={14} className="text-[#FFB800] animate-pulse" />
                  RED-YELLOW HAZARD ALARM
                </span>
                <span className="font-mono text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 font-bold uppercase rounded-xs">
                  UNKNOWN LOCATION
                </span>
              </div>
              <p className="font-tech text-xs text-gray-200 mt-1 leading-snug">
                {alarmMessage || 'Code defect detected! A terminal has been compromised. Search across facility rooms to locate and repair the bug!'}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0 hidden sm:flex flex-col items-end">
            <span className="font-pixel text-[10px] text-yellow-400 uppercase tracking-widest flex items-center gap-1">
              <Search size={12} className="animate-pulse text-yellow-400" />
              SEARCH ROOMS
            </span>
            <span className="font-mono text-[9px] text-gray-400 mt-0.5">
              MANUAL INSPECTION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
