import React from 'react';
import { useRoom } from '../hooks/useRoom';
import { useGame } from '../hooks/useGame';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import MeetingModal from '../components/meeting/MeetingModal';
import GameCanvas from '../map/GameCanvas';
// import Result from './Result';

export default function Room() {
  const { roomId } = useRoom();
  const { gamePhase } = useGame();

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative">
      {(gamePhase === 'LOBBY' || gamePhase === 'ROLE_REVEAL') && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/bg.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/assets/Bg_live.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {gamePhase === 'LOBBY' && <Lobby />}
      {gamePhase === 'ROLE_REVEAL' && <RoleReveal />}
      {gamePhase === 'PLAYING' && (
        <GameCanvas />
      )}
      {(gamePhase === 'MEETING' || gamePhase === 'VOTING') && (
        <>
          <div className="absolute inset-0 z-0 blur-sm pointer-events-none">
            <GameCanvas />
          </div>
          <MeetingModal />
        </>
      )}
    </div>
  );
}
