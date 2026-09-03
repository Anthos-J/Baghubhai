import { useState } from 'react';
import { PixelCard } from '../ui/PixelCard';
import { GameButton } from '../ui/GameButton';
import { StatusBadge } from '../ui/StatusBadge';
import { AlertTriangle, UserX, Users, FileCode } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { EvidenceDiffModal } from '../../editor';

export default function MeetingModal() {
  const { players } = usePlayers();
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col p-4 z-50 items-center justify-center">
      <div className="absolute inset-0 bg-black/80 z-0 backdrop-blur-sm"></div>
      
      <div className="z-10 text-center mb-6">
        <h1 className="font-pixel text-4xl text-warning drop-shadow-[0_0_15px_#FFB800] flex items-center justify-center gap-4">
          <AlertTriangle size={40} className="animate-pulse" />
          EMERGENCY MEETING
          <AlertTriangle size={40} className="animate-pulse" />
        </h1>
        <p className="font-tech mt-2 text-xl text-gray-300">DISCUSS AND VOTE</p>
        <div className="mt-3 font-mono text-primary text-2xl animate-pulse">01:15</div>

        {/* Evidence Inspection Action */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <button
            id="inspect-evidence-btn"
            onClick={() => setShowEvidence(true)}
            className="border-2 border-warning text-warning bg-warning/10 hover:bg-warning hover:text-black font-pixel text-xs px-6 py-2.5 transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <FileCode size={16} />
            [ INSPECT CODE EVIDENCE ]
          </button>
          <span className="font-tech text-xs text-gray-400">
            Review code changes and suspicious activity before voting.
          </span>
        </div>
      </div>

      <PixelCard className="w-full max-w-5xl z-10 bg-panel/90">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {players.map((p) => (
            <div key={p.id} className={`border-4 p-4 flex flex-col items-center gap-3 transition-transform ${!p.alive ? 'border-gray-800 opacity-50 grayscale' : 'border-panelBorder hover:border-primary cursor-pointer hover:-translate-y-1'}`}>
              <div className="w-16 h-16 bg-black border-2 border-gray-600 flex items-center justify-center" style={{ color: p.alive ? p.color : '#555' }}>
                {!p.alive ? <UserX size={32} className="text-mafia" /> : <Users size={32} />}
              </div>
              <div className="font-tech font-bold text-center w-full truncate">{p.username}</div>
              {p.alive ? (
                <GameButton variant="primary" className="w-full py-1 text-xs">VOTE</GameButton>
              ) : (
                <StatusBadge status="offline" label="ELIMINATED" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 border-t-4 border-panelBorder pt-4 flex justify-between">
          <GameButton variant="ghost">SKIP VOTE</GameButton>
          <div className="font-mono text-sm text-gray-500 mt-2">VOTES CAST: 0/{players.filter(p => p.alive).length}</div>
        </div>
      </PixelCard>

      {/* Reusable P2 Evidence Diff Modal Overlay */}
      {showEvidence && (
        <EvidenceDiffModal
          onClose={() => setShowEvidence(false)}
          title="EMERGENCY MEETING // EVIDENCE LOGS"
        />
      )}
    </div>
  );
}

