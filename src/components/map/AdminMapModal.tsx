import { useMemo } from 'react';
import { X, Users, MapPin, Radio, Shield, Navigation } from 'lucide-react';
import { MAP_ROOMS, WORLD_WIDTH, WORLD_HEIGHT } from '../../map/MapData';
import { usePlayers } from '../../hooks/usePlayers';

// ── Game Character Developer Avatar Graphic ──
function DeveloperAvatarIcon() {
  return (
    <div className="relative w-7 h-8 sm:w-8 sm:h-9 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] inline-flex items-center justify-center transition-transform hover:scale-110">
      <img
        src="/assets/White.png"
        alt="Developer Avatar"
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
}

// ── Facility Room Metadata with Architectural Department Styling ──
interface RoomSchematicDef {
  id: string;
  name: string;
  shortCode: string;
  subTitle: string;
  accent: string;
  borderClass: string;
  bgGlowClass: string;
  badgeColor: string;
}

const ROOM_METADATA: Record<string, RoomSchematicDef> = {
  central_hub: {
    id: 'central_hub',
    name: 'CENTRAL HUB / CAFETERIA',
    shortCode: 'SEC-01',
    subTitle: 'Emergency Central Station',
    accent: '#00F0FF',
    borderClass: 'border-[#00F0FF]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(0,240,255,0.25)]',
    badgeColor: 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]',
  },
  library: {
    id: 'library',
    name: 'LIBRARY & ARCHIVES',
    shortCode: 'SEC-02',
    subTitle: 'Auth Terminal & Database',
    accent: '#38bdf8',
    borderClass: 'border-[#38bdf8]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.25)]',
    badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-500',
  },
  medbay: {
    id: 'medbay',
    name: 'MEDICAL BAY',
    shortCode: 'SEC-03',
    subTitle: 'Biometric Scanner Ward',
    accent: '#10b981',
    borderClass: 'border-[#10b981]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500',
  },
  storage: {
    id: 'storage',
    name: 'STORAGE & CARGO',
    shortCode: 'SEC-04',
    subTitle: 'Cargo Sorting & Logistics',
    accent: '#f59e0b',
    borderClass: 'border-[#f59e0b]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500',
  },
  command: {
    id: 'command',
    name: 'COMMAND & TECH',
    shortCode: 'SEC-05',
    subTitle: 'Mainframe Control Center',
    accent: '#a855f7',
    borderClass: 'border-[#a855f7]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-500',
  },
  dev_lab: {
    id: 'dev_lab',
    name: 'DEV WORKSTATIONS',
    shortCode: 'SEC-06',
    subTitle: 'Code Terminal Workstations',
    accent: '#06b6d4',
    borderClass: 'border-[#06b6d4]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500',
  },
  mafia_lair: {
    id: 'mafia_lair',
    name: 'DARK LAIR',
    shortCode: 'SEC-07',
    subTitle: 'Restricted Sub-Level Zone',
    accent: '#ef4444',
    borderClass: 'border-[#ef4444]',
    bgGlowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.25)]',
    badgeColor: 'bg-red-950/60 text-red-300 border-red-500',
  },
};

// ── Non-Overlapping Geometric Corridor Pathways Connecting Cleanly at Room Doorways ──
const SCHEMATIC_CORRIDORS = [
  // 1. Library East doorway to Central Hub West doorway
  'M 980,440 L 1070,440 L 1070,780 L 1160,780',

  // 2. Library South doorway to Dark Lair North doorway
  'M 460,560 L 460,1040',

  // 3. Central Hub North doorway to Medbay South doorway
  'M 1560,680 L 1560,620 L 1720,620 L 1720,560',

  // 4. Medbay East doorway to Storage North doorway
  'M 2420,440 L 2540,440 L 2540,660',

  // 5. Central Hub East doorway to Storage West doorway
  'M 1760,880 L 2360,880',

  // 6. Central Hub South doorway to Dev Workstations North doorway
  'M 1320,1120 L 1320,1360',

  // 7. Central Hub South-East to Command West doorway
  'M 1640,1120 L 1640,1220 L 1840,1220 L 1840,1400 L 1940,1400',

  // 8. Dev Workstations East doorway to Command West doorway
  'M 1560,1540 L 1940,1540',

  // 9. Dark Lair East doorway branching to Dev Workstations & Central Hub
  'M 740,1200 L 830,1200 L 830,1440 L 920,1440',
  'M 830,1200 L 1020,1200 L 1020,1020 L 1160,1020',
];

// Doorway Threshold Portals (visual architectural airlock rings)
const DOORWAY_PORTALS = [
  { x: 980, y: 440 }, // Library East
  { x: 460, y: 560 }, // Library South
  { x: 1160, y: 780 }, // Central Hub West
  { x: 1560, y: 680 }, // Central Hub North
  { x: 1760, y: 880 }, // Central Hub East
  { x: 1320, y: 1120 }, // Central Hub South
  { x: 1640, y: 1120 }, // Central Hub South-East
  { x: 1160, y: 1020 }, // Central Hub South-West
  { x: 1720, y: 560 }, // Medbay South
  { x: 2420, y: 440 }, // Medbay East
  { x: 2360, y: 880 }, // Storage West
  { x: 2540, y: 660 }, // Storage North
  { x: 1940, y: 1400 }, // Command West-Upper
  { x: 1940, y: 1540 }, // Command West-Lower
  { x: 1320, y: 1360 }, // Dev Lab North
  { x: 1560, y: 1540 }, // Dev Lab East
  { x: 920, y: 1440 }, // Dev Lab West
  { x: 460, y: 1040 }, // Dark Lair North
  { x: 740, y: 1200 }, // Dark Lair East
];

interface AdminMapModalProps {
  onClose: () => void;
}

export default function AdminMapModal({ onClose }: AdminMapModalProps) {
  const { players, localPlayer } = usePlayers();
  const alivePlayers = useMemo(
    () => players.filter((p) => p.alive !== false && p.connected),
    [players]
  );

  // Player position relative to the world map (3072 x 2048)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* ── Outer Sci-Fi Command Radar Frame ── */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[820px] bg-[#070b14]/98 border-2 sm:border-4 border-[#00F0FF]/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Futuristic Radar Grid Background & Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00F0FF]/5 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00F0FF08_1px,transparent_1px),linear-gradient(to_bottom,#00F0FF08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* ── 1. TOP BAR: Close Button, Title & Current Telemetry ── */}
        <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-900/90 hover:bg-[#FF003C]/20 border-2 border-gray-700 hover:border-[#FF003C] text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Close Facility Radar [ESC or M]"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wider">
                  FACILITY SCHEMATIC // ARCHITECTURAL RADAR
                </h2>
              </div>
              <p className="font-tech text-[11px] text-gray-400 mt-0.5 tracking-wide">
                DEEP SPACE ORBITAL STATION • REAL-TIME BIOMETRIC OCCUPANCY
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-black/80 border border-panelBorder px-3 py-1.5 rounded-lg flex items-center gap-2">
              <MapPin size={15} className="text-primary animate-pulse" />
              <div className="text-right">
                <div className="font-tech text-[9px] text-gray-400 uppercase leading-none">YOUR LOCATION</div>
                <div className="font-tech font-bold text-xs text-white leading-tight mt-0.5">
                  {currentRoom ? currentRoom.name : 'IN CORRIDOR / TRANSIT'}
                </div>
              </div>
            </div>

            <div className="bg-black/80 border border-panelBorder px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Users size={15} className="text-success" />
              <div className="text-right">
                <div className="font-tech text-[9px] text-gray-400 uppercase leading-none">CREW DETECTED</div>
                <div className="font-mono font-bold text-xs text-success leading-tight mt-0.5">
                  {alivePlayers.length} ALIVE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. SCALED SCHEMATIC VIEWPORT (Zero Overlapping Chambers) ── */}
        <div className="relative flex-1 w-full bg-[#050911]/90 border border-gray-800/80 rounded-xl overflow-hidden shadow-inner p-1 sm:p-2">
          {/* Subtle Radar Sweep Effect Line */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(180deg,transparent_0%,rgba(0,240,255,0.03)_50%,transparent_100%)] animate-pulse" />

          {/* ── SVG Hallway Conduits Layer (Connecting Cleanly at Doorways) ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
            preserveAspectRatio="none"
          >
            {/* Outer Structural Conduit Shell (Deep Navy Hallways) */}
            {SCHEMATIC_CORRIDORS.map((dPath, i) => (
              <path
                key={`outer-${i}`}
                d={dPath}
                fill="none"
                stroke="#172554"
                strokeWidth="56"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            ))}

            {/* Inner Walkable Hallway Floor */}
            {SCHEMATIC_CORRIDORS.map((dPath, i) => (
              <path
                key={`inner-${i}`}
                d={dPath}
                fill="none"
                stroke="#080e1a"
                strokeWidth="42"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Glowing Neon Guide Path Line */}
            {SCHEMATIC_CORRIDORS.map((dPath, i) => (
              <path
                key={`guide-${i}`}
                d={dPath}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeDasharray="16 12"
                opacity="0.45"
              />
            ))}

            {/* Doorway Airlock Entry Seals */}
            {DOORWAY_PORTALS.map((pt, i) => (
              <g key={`portal-${i}`}>
                <circle cx={pt.x} cy={pt.y} r="18" fill="#172554" stroke="#00F0FF" strokeWidth="3" opacity="0.9" />
                <circle cx={pt.x} cy={pt.y} r="7" fill="#00F0FF" opacity="0.8" />
              </g>
            ))}
          </svg>

          {/* ── Render Non-Overlapping Architectural Room Modules ── */}
          {MAP_ROOMS.map((room) => {
            const isLocalPlayerInRoom = currentRoom?.id === room.id;
            const meta = ROOM_METADATA[room.id] || {
              id: room.id,
              name: room.name,
              shortCode: 'SEC-RM',
              subTitle: 'Facility Chamber',
              accent: '#00F0FF',
              borderClass: 'border-[#00F0FF]',
              bgGlowClass: 'shadow-[0_0_20px_rgba(0,240,255,0.2)]',
              badgeColor: 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]',
            };

            // Calculate active occupants in this room
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
                className={`absolute rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all flex flex-col justify-between p-2 sm:p-3 overflow-hidden ${
                  isLocalPlayerInRoom
                    ? 'bg-gradient-to-b from-[#111e33] to-[#0a1322] border-success text-white shadow-[0_0_35px_rgba(0,255,102,0.6)] z-20 scale-[1.01]'
                    : count > 0
                    ? `bg-gradient-to-b from-[#0f172a] to-[#070b14] ${meta.borderClass} text-white ${meta.bgGlowClass} z-10`
                    : 'bg-gradient-to-b from-[#0a0f1d]/95 to-[#050811]/95 border-gray-700/80 text-gray-300 shadow-md hover:border-gray-500 z-10'
                }`}
              >
                {/* Chamber Header: Section Code & Name */}
                <div className="flex items-center justify-between gap-1 w-full border-b border-white/10 pb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-gray-400 bg-black/60 px-1.5 py-0.5 rounded border border-gray-700/60">
                      {meta.shortCode}
                    </span>
                    <span className="font-tech font-bold text-xs sm:text-sm tracking-wide text-white uppercase truncate">
                      {room.name.split('/')[0].trim()}
                    </span>
                  </div>

                  {isLocalPlayerInRoom && (
                    <span className="flex items-center gap-1 bg-success/20 border border-success text-success font-pixel text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded animate-pulse whitespace-nowrap">
                      <Navigation size={10} /> YOU
                    </span>
                  )}
                </div>

                {/* Center Occupancy Area with Authentic Game Developer Avatars */}
                <div className="flex-1 w-full flex items-center justify-center my-1 sm:my-1.5">
                  {count > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 max-w-full">
                      {Array.from({ length: Math.min(count, 5) }).map((_, idx) => (
                        <div key={idx} className="animate-in zoom-in-75 duration-200">
                          <DeveloperAvatarIcon />
                        </div>
                      ))}
                      {count > 5 && (
                        <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded-full border border-gray-600 shadow">
                          +{count - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-500/70 font-tech text-[10px] tracking-wider uppercase">
                      <Shield size={12} className="opacity-40" />
                      <span>NO LIFE SIGNS</span>
                    </div>
                  )}
                </div>

                {/* Bottom Status Pill */}
                <div className="flex items-center justify-between w-full pt-1 border-t border-white/5">
                  <span className="font-tech text-[9px] sm:text-[10px] text-gray-400 truncate max-w-[65%]">
                    {meta.subTitle}
                  </span>
                  <div
                    className={`font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border ${
                      count > 0 ? meta.badgeColor : 'bg-black/60 text-gray-500 border-gray-800'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        count > 0 ? 'bg-success animate-ping' : 'bg-gray-600'
                      }`}
                    />
                    <span>
                      {count} {count === 1 ? 'PERSON' : 'PEOPLE'}
                    </span>
                  </div>
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
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-75"
            >
              <div className="absolute -inset-3 rounded-full bg-[#00F0FF]/40 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-[#00F0FF] border-2 border-white shadow-[0_0_20px_#00F0FF] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* ── 3. BOTTOM FOOTER & LEGEND ── */}
        <div className="relative z-10 flex flex-wrap items-center justify-between pt-2.5 mt-2 border-t border-gray-800/80 text-[11px] font-tech text-gray-400">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00F0FF] border border-white shadow-[0_0_8px_#00F0FF]" />
              <span className="text-gray-200">Your Live Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-900 border border-success" />
              <span>Occupied Chamber</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-900 border border-gray-700" />
              <span>Empty Chamber</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1.5 bg-[#172554] border-t border-b border-[#00F0FF]/50" />
              <span>Airlock Conduits</span>
            </div>
          </div>

          <div className="text-gray-400 font-mono text-[10px] hidden md:block">
            PRESS <span className="text-primary font-bold">[M]</span> OR <span className="text-primary font-bold">[ESC]</span> TO DISMISS
          </div>
        </div>
      </div>
    </div>
  );
}

