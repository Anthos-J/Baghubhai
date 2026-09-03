import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  MessageSquare,
  Check,
  X,
  Send,
  Vote,
  Users,
} from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { useMockStore, ChatMessage } from '../../store/mockStore';
import { supabase } from '../../lib/supabase';

// ── Stylized Crewmate SVG Icon ──
function CrewmateAvatar({ color, dead }: { color: string; dead?: boolean }) {
  return (
    <div className="relative w-8 h-9 flex-shrink-0">
      <svg viewBox="0 0 40 45" className="w-full h-full drop-shadow-sm">
        {/* Backpack */}
        <rect
          x="3"
          y="14"
          width="7"
          height="18"
          rx="3.5"
          fill={dead ? '#4a5568' : color}
          stroke="#1a202c"
          strokeWidth="2.5"
        />
        {/* Main Body */}
        <rect
          x="8"
          y="6"
          width="24"
          height="30"
          rx="12"
          fill={dead ? '#4a5568' : color}
          stroke="#1a202c"
          strokeWidth="2.5"
        />
        {/* Left Leg */}
        <rect
          x="9"
          y="30"
          width="8"
          height="12"
          rx="4"
          fill={dead ? '#4a5568' : color}
          stroke="#1a202c"
          strokeWidth="2.5"
        />
        {/* Right Leg */}
        <rect
          x="23"
          y="30"
          width="8"
          height="12"
          rx="4"
          fill={dead ? '#4a5568' : color}
          stroke="#1a202c"
          strokeWidth="2.5"
        />
        {/* Visor */}
        <rect
          x="18"
          y="11"
          width="16"
          height="10"
          rx="5"
          fill={dead ? '#718096' : '#75d2eb'}
          stroke="#1a202c"
          strokeWidth="2"
        />
        {/* Visor Glass Highlight */}
        {!dead && <ellipse cx="27" cy="14" rx="4" ry="2" fill="#e0f7fa" />}
      </svg>

      {/* Dead Player Red X Across Body */}
      {dead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 40 45" className="w-full h-full">
            <line x1="5" y1="8" x2="35" y2="38" stroke="#e53e3e" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="35" y1="8" x2="5" y2="38" stroke="#e53e3e" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function MeetingModal() {
  const { players, localPlayerState } = usePlayers();
  const session = useMockStore((s) => s.session);
  const roomId = session?.roomId || '';
  const myPlayerId = localPlayerState?.playerId || session?.playerId || '';
  const myUsername = session?.username || 'You';
  const myColor = session?.color || '#00F0FF';

  const meetingSubPhase = useMockStore((s) => s.meetingSubPhase);
  const meetingDiscussionTimer = useMockStore((s) => s.meetingDiscussionTimer);
  const meetingVotingTimer = useMockStore((s) => s.meetingVotingTimer);
  const tickMeetingTimer = useMockStore((s) => s.tickMeetingTimer);
  const meetingCallerName = useMockStore((s) => s.meetingCallerName);

  const votes = useMockStore((s) => s.votes);
  const castVote = useMockStore((s) => s.castVote);
  const retractVote = useMockStore((s) => s.retractVote);
  const votingResult = useMockStore((s) => s.votingResult);
  const meetingChatMessages = useMockStore((s) => s.meetingChatMessages);
  const addChatMessage = useMockStore((s) => s.addChatMessage);

  const [messageInput, setMessageInput] = useState('');
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(meetingChatMessages.length);

  // ── Meeting Timer Ticking Effect ──
  useEffect(() => {
    const interval = setInterval(() => {
      tickMeetingTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickMeetingTimer]);

  // ── Auto-scroll chat & handle unread notification badge ──
  useEffect(() => {
    if (meetingChatMessages.length > prevMsgCountRef.current) {
      if (!isChatOpen) {
        setHasUnreadChat(true);
      }
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMsgCountRef.current = meetingChatMessages.length;
  }, [meetingChatMessages, isChatOpen]);

  // ── Format Timer (MM:SS or SS) ──
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${secs}s`;
  };

  // ── Send Chat Message ──
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      playerId: myPlayerId,
      username: myUsername,
      color: myColor,
      text,
      timestamp: Date.now(),
    };

    addChatMessage(newMsg);
    setMessageInput('');

    if (roomId) {
      supabase.channel(`room:${roomId}:events`).send({
        type: 'broadcast',
        event: 'meeting_chat',
        payload: { message: newMsg },
      });
    }
  };

  // ── Handle Vote Cast ──
  const handleVote = (targetId: string | 'SKIP') => {
    castVote(myPlayerId, targetId);

    if (roomId) {
      supabase.channel(`room:${roomId}:events`).send({
        type: 'broadcast',
        event: 'meeting_vote',
        payload: { voterId: myPlayerId, targetId },
      });
    }
  };

  // ── Handle Retract Vote (Change Decision) ──
  const handleRetract = () => {
    retractVote(myPlayerId);

    if (roomId) {
      supabase.channel(`room:${roomId}:events`).send({
        type: 'broadcast',
        event: 'meeting_retract_vote',
        payload: { voterId: myPlayerId },
      });
    }
  };

  const myCurrentVote = votes[myPlayerId];
  const hasVoted = Boolean(myCurrentVote);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* ── THE AMONG US TABLET CASING (CYBERPUNK STYLED) ── */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#2b3342] to-[#1a202c] rounded-3xl p-3 sm:p-5 border-4 border-[#3b4759] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.15)] flex flex-col items-center">
        {/* Tablet Bezel Screws & Details */}
        <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-[#111] border border-gray-600" />
        <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-[#111] border border-gray-600" />
        <div className="absolute bottom-2 left-6 w-2 h-2 rounded-full bg-[#111] border border-gray-600" />
        <div className="absolute bottom-2 right-6 w-2 h-2 rounded-full bg-[#111] border border-gray-600" />

        {/* Tablet Right Side Home Button */}
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-500 shadow-inner" />

        {/* ── TABLET INNER SCREEN ── */}
        <div className="relative w-full bg-[#d6e7f2] border-4 border-[#1f2937] rounded-2xl p-4 sm:p-6 shadow-inner overflow-hidden flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
          {/* Subtle Screen Reflection & Scanlines */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* ── TOP HEADER ── */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="w-10" /> {/* Spacer to balance chat icon */}

            {/* Central Title */}
            <div className="text-center">
              <h1 className="font-pixel text-2xl sm:text-3xl text-[#1e293b] tracking-wider drop-shadow-sm flex items-center justify-center gap-2">
                Who Is The Mafia?
              </h1>
              <p className="font-tech text-xs sm:text-sm text-gray-600 uppercase tracking-widest mt-0.5">
                {meetingSubPhase === 'DISCUSSION' ? 'Discussion Phase' : 'Voting in Progress'}
              </p>
            </div>

            {/* Top Right Chat Button with Red Badge */}
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                setHasUnreadChat(false);
              }}
              className="relative p-2.5 rounded-lg bg-white/80 hover:bg-white border-2 border-[#94a3b8] text-[#1e293b] shadow-sm hover:shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Open Meeting Chat"
            >
              <MessageSquare size={22} className="text-[#334155]" />
              {/* Red Unread Notification Badge */}
              {hasUnreadChat && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          </div>

          {/* ── PLAYER CARDS GRID (2 COLUMNS) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 flex-1 items-start content-start overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
            {players.map((p) => {
              const isTargetOfMyVote = myCurrentVote === p.id;
              const hasThisPlayerVoted = Boolean(votes[p.id]);
              const isHovered = hoveredPlayerId === p.id;
              const isCaller = meetingCallerName && p.username.toLowerCase() === meetingCallerName.toLowerCase();
              const canVoteForThisPlayer = meetingSubPhase === 'VOTING' && p.alive;

              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setHoveredPlayerId(p.id)}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition-all select-none ${
                    !p.alive
                      ? 'bg-[#94a3b8]/70 border-[#64748b] opacity-60'
                      : isTargetOfMyVote
                      ? 'bg-white border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.5)] ring-2 ring-[#00F0FF]'
                      : 'bg-white/95 hover:bg-white border-[#94a3b8] hover:border-[#475569] shadow-sm'
                  }`}
                >
                  {/* "I VOTED" Red Diagonal Stamp Badge */}
                  {hasThisPlayerVoted && (
                    <div className="absolute -top-2 -left-2 z-10 rotate-[-15deg] bg-red-600 text-white font-tech text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-0.5 animate-in zoom-in-75">
                      <Check size={9} strokeWidth={3} /> I VOTED
                    </div>
                  )}

                  {/* Left: Crewmate Avatar & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CrewmateAvatar color={p.color} dead={!p.alive} />

                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`font-tech font-bold text-base sm:text-lg truncate ${
                          !p.alive ? 'line-through text-gray-700' : 'text-gray-900'
                        }`}
                      >
                        {p.username}
                      </span>

                      {/* Caller Megaphone Icon */}
                      {isCaller && (
                        <span title="Called Emergency Meeting" className="flex-shrink-0 animate-bounce">
                          <Megaphone size={18} className="text-gray-600 rotate-[-10deg]" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Hover Action Buttons (✓ and ✕) */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                    {canVoteForThisPlayer ? (
                      isHovered || isTargetOfMyVote ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-150">
                          {/* GREEN TICK BUTTON [✓] */}
                          <button
                            onClick={() => handleVote(p.id)}
                            title={`Vote for ${p.username}`}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-sm ${
                              isTargetOfMyVote
                                ? 'bg-[#48bb78] text-white border-[#276749]'
                                : 'bg-[#e6fffa] hover:bg-[#48bb78] text-[#2f855a] hover:text-white border-[#48bb78]'
                            }`}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>

                          {/* RED CROSS BUTTON [✕] */}
                          <button
                            onClick={handleRetract}
                            title="Cancel vote / Change decision"
                            className="w-8 h-8 rounded-lg border-2 border-[#f56565] bg-[#fff5f5] hover:bg-[#f56565] text-[#c53030] hover:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      ) : null
                    ) : !p.alive ? (
                      <span className="font-tech text-xs text-red-700 font-bold uppercase tracking-wide">
                        DEAD
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── BOTTOM BAR: SKIP VOTE & DYNAMIC TIMER ── */}
          <div className="relative flex items-center justify-between mt-4 pt-3 border-t-2 border-[#94a3b8]/60">
            {/* Bottom-Left: SKIP VOTE Capsule Button */}
            <div className="flex items-center gap-3">
              {meetingSubPhase === 'VOTING' ? (
                <>
                  <button
                    onClick={() => handleVote('SKIP')}
                    className={`font-pixel text-xs px-4 py-2 rounded-xl border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                      myCurrentVote === 'SKIP'
                        ? 'bg-[#48bb78] text-white border-[#22543d]'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {myCurrentVote === 'SKIP' ? '✓ SKIPPED VOTE' : 'SKIP VOTE'}
                  </button>

                  {hasVoted && (
                    <button
                      onClick={handleRetract}
                      className="font-tech text-xs text-red-600 hover:underline cursor-pointer"
                      title="Clear or change your vote"
                    >
                      [✕ CLEAR VOTE]
                    </button>
                  )}
                </>
              ) : (
                <div className="font-tech text-xs text-gray-600 tracking-wide">
                  💬 Discussion in progress
                </div>
              )}
            </div>

            {/* Bottom-Right: Timer Display */}
            <div className="font-tech font-bold text-sm sm:text-base text-gray-700 tracking-wide flex items-center gap-1">
              <span>
                {meetingSubPhase === 'DISCUSSION' ? 'Discussion Ends in:' : 'Voting Ends in:'}
              </span>
              <span
                className={`font-mono text-base sm:text-lg ${
                  meetingSubPhase === 'VOTING' && meetingVotingTimer <= 10
                    ? 'text-red-600 animate-pulse'
                    : 'text-gray-900'
                }`}
              >
                {meetingSubPhase === 'DISCUSSION'
                  ? formatTime(meetingDiscussionTimer)
                  : formatTime(meetingVotingTimer)}
              </span>
            </div>
          </div>

          {/* ── POPUP SLIDE-OUT CHAT DRAWER INSIDE TABLET ── */}
          {isChatOpen && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-[#1e293b]/95 border-l-4 border-panelBorder p-3 flex flex-col shadow-2xl z-30 animate-in slide-in-from-right duration-200 backdrop-blur-md">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700">
                <span className="font-pixel text-xs text-warning tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} /> MEETING CHAT
                </span>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto space-y-2 p-1 custom-scrollbar text-xs">
                {meetingChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 font-tech">
                    No messages yet. Defend your alibi or call out suspects!
                  </div>
                ) : (
                  meetingChatMessages.map((msg) => {
                    const isMe = msg.playerId === myPlayerId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                          <span style={{ color: msg.color }} className="font-bold">
                            {msg.username}
                          </span>
                        </div>
                        <div
                          className={`px-2.5 py-1.5 rounded-lg max-w-[90%] font-tech text-xs mt-0.5 break-words ${
                            isMe
                              ? 'bg-[#00F0FF]/20 text-white border border-[#00F0FF]/50'
                              : 'bg-black/60 text-gray-200 border border-gray-700'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Send message..."
                  maxLength={100}
                  className="flex-1 bg-black/80 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00F0FF] font-tech"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black font-bold rounded-lg cursor-pointer flex items-center justify-center transition-all"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── SPACE EJECTION RESULTS OVERLAY (WHEN VOTING RESOLVES) ── */}
      {meetingSubPhase === 'RESULTS' && votingResult && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 select-none overflow-hidden">
          {/* Subtle Starfield Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-black to-black pointer-events-none" />

          {/* Floating / Ejecting Character Animation */}
          {votingResult.eliminatedPlayerName && (
            <div className="relative z-10 mb-8 animate-bounce">
              <div className="w-24 h-28 transform -rotate-12 transition-transform drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <CrewmateAvatar
                  color={votingResult.eliminatedPlayerColor || '#00F0FF'}
                  dead={false}
                />
              </div>
            </div>
          )}

          {/* Main Ejection Text Announcement */}
          <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
            {votingResult.eliminatedPlayerName ? (
              <>
                <h2 className="font-pixel text-2xl sm:text-4xl text-white tracking-wider mb-3 drop-shadow-md">
                  {votingResult.eliminatedPlayerName}{' '}
                  {votingResult.wasImpostor ? (
                    <span className="text-red-500 drop-shadow-[0_0_15px_#FF003C]">
                      was An Impostor.
                    </span>
                  ) : (
                    <span className="text-[#00F0FF] drop-shadow-[0_0_15px_#00F0FF]">
                      was not An Impostor.
                    </span>
                  )}
                </h2>

                <p className="font-tech text-lg sm:text-xl text-gray-300 tracking-widest mt-4">
                  {votingResult.remainingImpostors === 0
                    ? 'No Impostors remain.'
                    : `${votingResult.remainingImpostors} Impostor${
                        votingResult.remainingImpostors === 1 ? '' : 's'
                      } remain${votingResult.remainingImpostors === 1 ? 's' : ''}.`}
                </p>
              </>
            ) : votingResult.isTie ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-black/80 border-2 border-warning flex items-center justify-center text-warning shadow-[0_0_20px_rgba(255,184,0,0.4)]">
                  <Users size={36} />
                </div>
                <h2 className="font-pixel text-2xl sm:text-3xl text-warning tracking-wider mb-2">
                  Tie detected. No one was ejected.
                </h2>
                <p className="font-tech text-base sm:text-lg text-gray-300 tracking-widest mt-2">
                  {votingResult.remainingImpostors} Impostor
                  {votingResult.remainingImpostors === 1 ? '' : 's'} remain
                  {votingResult.remainingImpostors === 1 ? 's' : ''}.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-black/80 border-2 border-gray-600 flex items-center justify-center text-gray-400">
                  <Vote size={36} />
                </div>
                <h2 className="font-pixel text-2xl sm:text-3xl text-gray-200 tracking-wider mb-2">
                  No one was ejected. (Skipped)
                </h2>
                <p className="font-tech text-base sm:text-lg text-gray-300 tracking-widest mt-2">
                  {votingResult.remainingImpostors} Impostor
                  {votingResult.remainingImpostors === 1 ? '' : 's'} remain
                  {votingResult.remainingImpostors === 1 ? 's' : ''}.
                </p>
              </>
            )}

            <p className="font-mono text-xs text-gray-500 mt-10 tracking-widest uppercase animate-pulse">
              Resuming operations in a moment...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
