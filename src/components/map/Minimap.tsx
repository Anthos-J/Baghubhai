import { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { MAP_ROOMS, WORLD_WIDTH, WORLD_HEIGHT } from '../../map/MapData';
import { usePlayers } from '../../hooks/usePlayers';

// ── Authentic Game Developer Avatar Icon (Matching game graphics) ──
export function DeveloperAvatar({ className = "w-5 h-5", count }: { className?: string; count?: number }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <img
        src="/assets/White.png"
        alt="Avatar"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          // Fallback if image path fails
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
      {count !== undefined && count > 1 && (
        <span className="absolute -bottom-1 -right-1 bg-black/90 border border-success text-success font-mono text-[9px] font-bold px-1 rounded-full leading-none">
          x{count}
        </span>
      )}
    </div>
  );
}

const MINIMAP_CORRIDORS = [
  'M 980,440 L 1070,440 L 1070,780 L 1160,780',
  'M 460,560 L 460,1040',
  'M 1560,680 L 1560,620 L 1720,620 L 1720,560',
  'M 2420,440 L 2540,440 L 2540,660',
  'M 1760,880 L 2360,880',
  'M 1320,1120 L 1320,1360',
  'M 1640,1120 L 1640,1220 L 1840,1220 L 1840,1400 L 1940,1400',
  'M 1560,1540 L 1940,1540',
  'M 740,1200 L 830,1200 L 830,1440 L 920,1440',
  'M 830,1200 L 1020,1200 L 1020,1020 L 1160,1020',
];

interface MinimapProps {
  onExpand: () => void;
}

export default function Minimap({ onExpand }: MinimapProps) {
  const { players, localPlayer } = usePlayers();
  const alivePlayers = useMemo(() => players.filter((p) => p.alive !== false && p.connected), [players]);

  // Determine which room the local player is currently inside
  const currentRoom = useMemo(() => {
    if (!localPlayer) return null;
    return (
      MAP_ROOMS.find(
        (r) =>
          localPlayer.x >= r.x &&
          localPlayer.x <= r.x + r.w &&
          localPlayer.y >= r.y &&
          localPlayer.y <= r.y + r.h
      ) || null
    );
  }, [localPlayer]);

  // Local player relative percentage position on map
  const playerXPercent = localPlayer ? (localPlayer.x / WORLD_WIDTH) * 100 : 50;
  const playerYPercent = localPlayer ? (localPlayer.y / WORLD_HEIGHT) * 100 : 50;

  return (
    <div
      onClick={onExpand}
      className="group relative w-60 sm:w-68 bg-black/90 border-2 border-panelBorder hover:border-success p-2 shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(0,255,102,0.15)] backdrop-blur-md cursor-pointer transition-all duration-200 rounded-xs select-none"
      title="Click or press [M] to expand full facility map"
    >
      {/* ── Header: Location & Expand Icon ── */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-panelBorder/70 text-[10px] font-tech">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-success animate-ping" />
          <span className="text-gray-400 font-bold uppercase truncate">
            {currentRoom ? currentRoom.name : 'IN CORRIDOR / TRANSIT'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-success group-hover:scale-110 transition-transform flex-shrink-0">
          <span className="font-mono text-[9px] text-gray-400 hidden sm:inline">[M]</span>
          <Maximize2 size={13} />
        </div>
      </div>

      {/* ── Radar Screen Container ── */}
      <div className="relative w-full aspect-[3/2] bg-[#070b12] border border-gray-800/80 rounded-xs overflow-hidden">
        {/* Subtle Green Radar Sweep Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-success/5 via-transparent to-black/60 pointer-events-none" />

        {/* ── SVG Corridor Conduits ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          preserveAspectRatio="none"
        >
          {MINIMAP_CORRIDORS.map((dPath, idx) => (
            <g key={idx}>
              <path
                d={dPath}
                fill="none"
                stroke="#172554"
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <path
                d={dPath}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeDasharray="14 10"
                opacity="0.5"
              />
            </g>
          ))}
        </svg>

        {/* ── Facility Rooms ── */}
        {MAP_ROOMS.map((room) => {
          const isPlayerHere = currentRoom?.id === room.id;

          // Count other players in this room
          const playersInRoom = alivePlayers.filter(
            (p) =>
              p.x >= room.x &&
              p.x <= room.x + room.w &&
              p.y >= room.y &&
              p.y <= room.y + room.h
          );
          const occupancy = playersInRoom.length;

          const left = (room.x / WORLD_WIDTH) * 100;
          const top = (room.y / WORLD_HEIGHT) * 100;
          const width = (room.w / WORLD_WIDTH) * 100;
          const height = (room.h / WORLD_HEIGHT) * 100;

          return (
            <div
              key={room.id}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
              className={`absolute rounded-xs border transition-all flex flex-col items-center justify-center p-0.5 ${
                isPlayerHere
                  ? 'bg-success/30 border-success shadow-[0_0_12px_rgba(0,255,102,0.6)] z-10'
                  : occupancy > 0
                  ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#0f172a]/70 border-gray-700/60'
              }`}
            >
              {/* Room Short Code */}
              <span
                className={`font-mono text-[7px] leading-none font-bold uppercase truncate px-0.5 ${
                  isPlayerHere ? 'text-white' : 'text-gray-400'
                }`}
              >
                {room.name.split('/')[0].split('&')[0].trim()}
              </span>

              {/* Occupant Avatar Graphic */}
              {occupancy > 0 && (
                <div className="mt-0.5">
                  <DeveloperAvatar className="w-3.5 h-3.5 sm:w-4 sm:h-4" count={occupancy} />
                </div>
              )}
            </div>
          );
        })}

        {/* ── Live Player Movement Blip Pin ── */}
        {localPlayer && (
          <div
            style={{
              left: `${playerXPercent}%`,
              top: `${playerYPercent}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            {/* Pulsing Sonar Ring */}
            <div className="absolute -inset-1.5 rounded-full bg-[#00F0FF]/50 animate-ping" />
            {/* Center Neon Blip */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] border-2 border-white shadow-[0_0_10px_#00F0FF]" />
          </div>
        )}
      </div>

      {/* ── Minimap Bottom Hint ── */}
      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-gray-500">
        <span>BIOMETRIC SENSORS ACTIVE</span>
        <span className="text-success font-bold">CLICK TO EXPAND</span>
      </div>
    </div>
  );
}
