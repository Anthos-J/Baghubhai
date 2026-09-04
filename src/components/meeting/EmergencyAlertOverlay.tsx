import { useEffect, useState } from 'react';
import { AlertTriangle, Radio } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';
import { getPlayerAvatarUrl } from '../../map/SpriteManager';

export default function EmergencyAlertOverlay() {
  const meetingAlertActive = useMockStore((s) => s.meetingAlertActive);
  const meetingCallerName = useMockStore((s) => s.meetingCallerName);
  const meetingCallerColor = useMockStore((s) => s.meetingCallerColor);
  const players = useMockStore((s) => s.players);
  const session = useMockStore((s) => s.session);
  const dismissMeetingAlert = useMockStore((s) => s.dismissMeetingAlert);
  const [countdown, setCountdown] = useState(3);

  const matchedPlayer = players.find(
    (p) =>
      p.username.toLowerCase() === (meetingCallerName || '').toLowerCase() ||
      (session?.username && session.username.toLowerCase() === (meetingCallerName || '').toLowerCase() && p.id === session.playerId)
  );
  const callerColor = meetingCallerColor || matchedPlayer?.color || session?.color || '#00F0FF';
  const callerAvatarUrl = getPlayerAvatarUrl(callerColor);

  useEffect(() => {
    if (!meetingAlertActive) {
      setCountdown(3);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          dismissMeetingAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [meetingAlertActive, dismissMeetingAlert]);

  useEffect(() => {
    if (!meetingAlertActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        dismissMeetingAlert();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [meetingAlertActive, dismissMeetingAlert]);

  if (!meetingAlertActive) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Red Alert Flash Background */}
      <div className="absolute inset-0 bg-red-950/40 animate-pulse pointer-events-none" />

      {/* Warning Hazard Stripes Top & Bottom */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_20px,#FFB800_20px,#FFB800_40px)] shadow-[0_0_20px_#FF003C]" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#FF003C,#FF003C_20px,#FFB800_20px,#FFB800_40px)] shadow-[0_0_20px_#FF003C]" />

      {/* Center Alert Box */}
      <div className="relative z-10 max-w-2xl w-full mx-4 border-4 border-[#FF003C] bg-black/90 p-8 text-center shadow-[0_0_60px_rgba(255,0,60,0.8)] backdrop-blur-md">
        <div className="flex items-center justify-center gap-4 text-[#FF003C] mb-4">
          <AlertTriangle size={56} className="animate-bounce" />
          <Radio size={48} className="animate-pulse text-[#FFB800]" />
          <AlertTriangle size={56} className="animate-bounce" />
        </div>

        <h1 className="font-pixel text-4xl sm:text-5xl text-[#FF003C] tracking-wider drop-shadow-[0_0_20px_#FF003C] mb-4 animate-pulse">
          EMERGENCY MEETING
        </h1>

        {/* Caller Avatar Card */}
        <div className="my-4 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
          <div
            className="w-28 h-32 sm:w-32 sm:h-36 border-4 bg-black/80 flex items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(255,0,60,0.6)] relative rounded"
            style={{ borderColor: callerColor }}
          >
            <img
              src={callerAvatarUrl}
              alt={meetingCallerName || 'Caller'}
              className="w-full h-full object-cover object-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="mt-3 inline-block bg-[#FF003C]/20 border-2 border-[#FF003C] px-6 py-1.5 rounded">
            <p className="font-tech text-xl text-gray-200">
              CALLED BY:{' '}
              <span
                className="font-bold text-2xl tracking-wide uppercase drop-shadow"
                style={{ color: callerColor }}
              >
                {meetingCallerName || 'CREWMATE'}
              </span>
            </p>
          </div>
        </div>

        <p className="font-mono text-sm text-gray-400 mt-4 tracking-widest uppercase">
          All tasks halted • Redirecting to conference room in{' '}
          <span className="text-[#00F0FF] font-bold text-lg">{countdown}s</span>
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={dismissMeetingAlert}
            className="font-pixel text-xs bg-[#FF003C] hover:bg-[#FF003C]/80 text-white px-6 py-2 border-2 border-[#FFB800] tracking-wider cursor-pointer shadow-[0_0_15px_#FF003C] transition-all hover:scale-105 active:scale-95"
          >
            JOIN MEETING NOW [ENTER]
          </button>
        </div>
      </div>
    </div>
  );
}
