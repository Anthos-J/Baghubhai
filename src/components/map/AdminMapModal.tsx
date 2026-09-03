import { X } from 'lucide-react';
import { MAP_ROOMS, WORLD_WIDTH, WORLD_HEIGHT } from '../../map/MapData';
import { usePlayers } from '../../hooks/usePlayers';

// ── Anonymous Grey Silhouette Crewmate Icon (as in Among Us Admin Map) ──
function AnonymousCrewmateIcon() {
  return (
    <svg viewBox="0 0 40 45" className="w-6 h-7 sm:w-7 sm:h-8 drop-shadow-md">
      {/* Backpack */}
      <rect x="3" y="14" width="7" height="18" rx="3.5" fill="#718096" stroke="#1a202c" strokeWidth="2" />
      {/* Body */}
      <rect x="8" y="6" width="24" height="30" rx="12" fill="#718096" stroke="#1a202c" strokeWidth="2" />
      {/* Left leg */}
      <rect x="9" y="30" width="8" height="12" rx="4" fill="#718096" stroke="#1a202c" strokeWidth="2" />
      {/* Right leg */}
      <rect x="23" y="30" width="8" height="12" rx="4" fill="#718096" stroke="#1a202c" strokeWidth="2" />
      {/* Visor */}
      <rect x="18" y="11" width="16" height="10" rx="5" fill="#a0aec0" stroke="#1a202c" strokeWidth="1.5" />
      {/* Visor Glint */}
      <ellipse cx="27" cy="14" rx="4" ry="2" fill="#e2e8f0" />
    </svg>
  );
}

interface AdminMapModalProps {
  onClose: () => void;
}

export default function AdminMapModal({ onClose }: AdminMapModalProps) {
  const { alivePlayers } = usePlayers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      {/* ── Outer Map Frame Container ── */}
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[680px] bg-[#111827]/95 border-4 border-panelBorder rounded-3xl p-4 sm:p-6 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,0,0.2)] overflow-hidden">
        {/* Subtle Radar Scanlines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ff66]/10 via-transparent to-black/80 pointer-events-none" />

        {/* ── Top Bar: Close Button & Facility Header ── */}
        <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b-2 border-gray-800">
          {/* Top-Left Close Button (X) */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-400 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-lg"
            title="Close Map [ESC or M]"
          >
            <X size={22} strokeWidth={3} />
          </button>

          <div className="text-center flex-1 pr-10">
            <h2 className="font-pixel text-xl sm:text-2xl text-white tracking-wider flex items-center justify-center gap-2">
              <span className="text-success animate-pulse">●</span> FACILITY RADAR // OCCUPANCY
            </h2>
            <p className="font-tech text-xs text-gray-400 uppercase tracking-widest mt-0.5">
              ANONYMOUS BIOMETRIC SCAN • SENSORS ACTIVE
            </p>
          </div>
        </div>

        {/* ── Scaled Facility Map Layout Replicating the Main Map ── */}
        <div className="relative flex-1 w-full h-full bg-[#0a0f16] border-2 border-gray-800 rounded-2xl overflow-hidden p-2 sm:p-4 shadow-inner">
          {/* Corridor Connections between rooms */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}>
            {/* Corridor: Mainframe to Central Hub */}
            <rect x="950" y="400" width="100" height="150" fill="#00ff66" opacity="0.3" rx="10" />
            {/* Corridor: Auth Lab to Central Hub */}
            <rect x="500" y="320" width="300" height="80" fill="#00ff66" opacity="0.3" rx="10" />
            <rect x="740" y="320" width="80" height="250" fill="#00ff66" opacity="0.3" rx="10" />
            {/* Corridor: Database Room to Central Hub */}
            <rect x="1200" y="320" width="300" height="80" fill="#00ff66" opacity="0.3" rx="10" />
            <rect x="1180" y="320" width="80" height="250" fill="#00ff66" opacity="0.3" rx="10" />
            {/* Corridor: Utilities Lab to Central Hub */}
            <rect x="500" y="1100" width="300" height="80" fill="#00ff66" opacity="0.3" rx="10" />
            <rect x="740" y="930" width="80" height="250" fill="#00ff66" opacity="0.3" rx="10" />
            {/* Corridor: Payment Lab to Central Hub */}
            <rect x="1200" y="1100" width="300" height="80" fill="#00ff66" opacity="0.3" rx="10" />
            <rect x="1180" y="930" width="80" height="250" fill="#00ff66" opacity="0.3" rx="10" />
          </svg>

          {/* ── Render Map Rooms exactly replicating MapData proportions ── */}
          {MAP_ROOMS.map((room) => {
            // Calculate player count in this room
            const playersInRoom = alivePlayers.filter(
              (p) =>
                p.x >= room.x &&
                p.x <= room.x + room.w &&
                p.y >= room.y &&
                p.y <= room.y + room.h
            );
            const count = playersInRoom.length;

            // Proportional coordinates
            const leftPercent = (room.x / WORLD_WIDTH) * 100;
            const topPercent = (room.y / WORLD_HEIGHT) * 100;
            const widthPercent = (room.w / WORLD_WIDTH) * 100;
            const heightPercent = (room.h / WORLD_HEIGHT) * 100;

            return (
              <div
                key={room.id}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                }}
                className={`absolute rounded-2xl border-4 transition-all flex flex-col items-center justify-between p-2 sm:p-3 shadow-lg ${
                  count > 0
                    ? 'bg-[#00e639] border-white text-black shadow-[0_0_25px_rgba(0,255,0,0.6)]'
                    : 'bg-[#00c832]/85 border-[#a3f3b6] text-black shadow-md'
                }`}
              >
                {/* Room Title */}
                <span className="font-tech font-bold text-xs sm:text-sm tracking-wider uppercase text-center drop-shadow-sm line-clamp-1">
                  {room.name}
                </span>

                {/* Occupancy Icons Area */}
                <div className="flex-1 w-full flex items-center justify-center my-1">
                  {count > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
                      {Array.from({ length: Math.min(count, 5) }).map((_, idx) => (
                        <div key={idx} className="animate-in zoom-in-75 duration-200">
                          <AnonymousCrewmateIcon />
                        </div>
                      ))}
                      {count > 5 && (
                        <span className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5 rounded-full">
                          +{count - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-tech text-black/40 font-bold">
                      EMPTY
                    </span>
                  )}
                </div>

                {/* Count Pill */}
                <div className="bg-black/90 text-white font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-black/30 shadow-inner">
                  {count} {count === 1 ? 'PERSON' : 'PEOPLE'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Legend ── */}
        <div className="relative z-10 flex items-center justify-between pt-3 mt-2 border-t border-gray-800 text-xs font-tech text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00e639] border border-white" />
            <span>Active Room Zones (Real-time occupancy)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Anonymous radar view • Press [M] or [ESC] to return</span>
          </div>
        </div>
      </div>
    </div>
  );
}
