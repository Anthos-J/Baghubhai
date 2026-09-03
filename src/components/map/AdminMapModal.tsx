import { useMemo } from 'react';
import { X } from 'lucide-react';
import { MAP_ROOMS, CORRIDOR_FLOORS, WORLD_WIDTH, WORLD_HEIGHT } from '../../map/MapData';
import { usePlayers } from '../../hooks/usePlayers';

// ── Game Character Developer Avatar Graphic (Anonymous silhouette from game graphics) ──
function GameDeveloperAvatarIcon() {
  return (
    <div className="relative w-7 h-8 sm:w-8 sm:h-9 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] inline-flex items-center justify-center">
      <img
        src="/assets/White.png"
        alt="Developer Avatar"
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          // Fallback SVG if image not found
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
}

interface AdminMapModalProps {
  onClose: () => void;
}

export default function AdminMapModal({ onClose }: AdminMapModalProps) {
  const { players, localPlayer } = usePlayers();
  const alivePlayers = useMemo(
    () => players.filter((p) => p.alive !== false && p.connected),
    [players]
  );

  // Player position relative to the world map
  const playerXPercent = localPlayer ? (localPlayer.x / WORLD_WIDTH) * 100 : 50;
  const playerYPercent = localPlayer ? (localPlayer.y / WORLD_HEIGHT) * 100 : 50;

  // Active room player is currently inside
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* ── Outer Map Frame Container ── */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[720px] bg-[#111827]/95 border-4 border-panelBorder rounded-3xl p-4 sm:p-6 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,0,0.2)] overflow-hidden">
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
              <span className="text-success animate-pulse">●</span> FACILITY RADAR // BIOMETRIC OCCUPANCY
            </h2>
            <p className="font-tech text-xs text-gray-400 uppercase tracking-widest mt-0.5">
              {currentRoom ? (
                <span>
                  YOUR LOCATION:{' '}
                  <span className="text-success font-bold">{currentRoom.name}</span>
                </span>
              ) : (
                'IN CORRIDOR / TRANSIT'
              )}
            </p>
          </div>
        </div>

        {/* ── Scaled Facility Map Layout Replicating the Main Map with Pathways ── */}
        <div className="relative flex-1 w-full h-full bg-[#0a0f16] border-2 border-gray-800 rounded-2xl overflow-hidden p-2 sm:p-4 shadow-inner">
          {/* ── Accurate Corridor Floors from MapData ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          >
            {CORRIDOR_FLOORS.map((c, i) => (
              <rect
                key={i}
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                fill="#00ff66"
                opacity="0.35"
                rx="14"
              />
            ))}
          </svg>

          {/* ── Render Map Rooms exactly replicating MapData proportions ── */}
          {MAP_ROOMS.map((room) => {
            const isLocalPlayerInRoom = currentRoom?.id === room.id;

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
                  isLocalPlayerInRoom
                    ? 'bg-[#00e639] border-white text-black shadow-[0_0_30px_rgba(0,255,0,0.8)] z-10 scale-[1.02]'
                    : count > 0
                    ? 'bg-[#00c832] border-white text-black shadow-[0_0_20px_rgba(0,255,0,0.5)]'
                    : 'bg-[#00c832]/75 border-[#a3f3b6] text-black shadow-md'
                }`}
              >
                {/* Room Title */}
                <div className="flex items-center gap-1.5 max-w-full">
                  {isLocalPlayerInRoom && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  )}
                  <span className="font-tech font-bold text-xs sm:text-sm tracking-wider uppercase text-center drop-shadow-sm line-clamp-1">
                    {room.name}
                  </span>
                </div>

                {/* Occupancy Icons Area with Game Graphic Avatars */}
                <div className="flex-1 w-full flex items-center justify-center my-1">
                  {count > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                      {Array.from({ length: Math.min(count, 6) }).map((_, idx) => (
                        <div key={idx} className="animate-in zoom-in-75 duration-200">
                          <GameDeveloperAvatarIcon />
                        </div>
                      ))}
                      {count > 6 && (
                        <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded-full shadow">
                          +{count - 6}
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
                <div className="bg-black/90 text-white font-mono text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      count > 0 ? 'bg-[#00e639] animate-pulse' : 'bg-gray-500'
                    }`}
                  />
                  <span>
                    {count} {count === 1 ? 'PERSON' : 'PEOPLE'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* ── Live Player Traversal Radar Pin ── */}
          {localPlayer && (
            <div
              style={{
                left: `${playerXPercent}%`,
                top: `${playerYPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75"
            >
              <div className="absolute -inset-2.5 rounded-full bg-[#00F0FF]/40 animate-ping" />
              <div className="w-4 h-4 rounded-full bg-[#00F0FF] border-2 border-white shadow-[0_0_15px_#00F0FF] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Legend ── */}
        <div className="relative z-10 flex items-center justify-between pt-3 mt-2 border-t border-gray-800 text-xs font-tech text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00e639] border border-white" />
              <span>Real-time Occupancy Radar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00F0FF] border border-white" />
              <span>Your Live Position</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Anonymous biometric view • Press [M] or [ESC] to return</span>
          </div>
        </div>
      </div>
    </div>
  );
}
