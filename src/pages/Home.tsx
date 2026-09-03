import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { useMockStore } from '../store/mockStore';
import {
  createRoom,
  joinRoom,
  getSession,
  getSavedUsername,
  getSavedColor,
  getRandomPlayerColor,
} from '../lib/roomService';
import { PLAYER_COLORS } from '../types/game';
import {
  Settings,
  HelpCircle,
  Trophy,
  Volume2,
  Plus,
  LogIn,
  Play,
  BookOpen,
  AlertCircle,
  MessageSquareWarning,
  Megaphone,
  CheckSquare,
  Users,
  ShieldAlert,
  ArrowRight,
  DiscIcon as DiscordIcon,
  Loader2,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const setSession = useMockStore((s) => s.setSession);

  // ── Username / Color state ──
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(getRandomPlayerColor());
  const [hasUsername, setHasUsername] = useState(false);

  // ── Room code input ──
  const [roomCode, setRoomCode] = useState('');

  // ── Loading / error states ──
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Restore saved username ──
  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) {
      // Already in a room — redirect back
      navigate(`/room/${existingSession.roomId}`);
      return;
    }

    const saved = getSavedUsername();
    const savedColor = getSavedColor();
    if (saved) {
      setUsername(saved);
      setHasUsername(true);
    }
    if (savedColor) {
      setSelectedColor(savedColor);
    }
  }, []);

  // ── Handlers ──
  const handleContinue = () => {
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }
    setError(null);
    setHasUsername(true);
  };

  const handleCreateRoom = async () => {
    if (!username.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const session = await createRoom(username.trim(), selectedColor);
      setSession(session);
      navigate(`/room/${session.roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      setError('Enter a valid room code.');
      return;
    }
    setIsJoining(true);
    setError(null);
    try {
      const session = await joinRoom(username.trim(), selectedColor, roomCode.trim());
      setSession(session);
      navigate(`/room/${session.roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleQuickPlay = () => handleCreateRoom();

  // ──────────────────────────────────────────────
  // RENDER — Username entry modal (Step 1)
  // ──────────────────────────────────────────────
  if (!hasUsername) {
    return (
      <div className="w-full flex-1 min-h-screen flex flex-col items-center justify-center relative text-textMain">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/bg.jpg')" }}
        />

        <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 p-8">
          {/* Logo */}
          <h1 className="font-pixel text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] leading-tight whitespace-nowrap mb-2">
            &lt;<span className="text-[#0066FF]">AMONG</span>{' '}
            <span className="text-mafia">DEVS</span>&gt;
          </h1>
          <div className="inline-block border-2 border-panelBorder bg-panel/80 px-6 py-2 font-mono font-bold tracking-[0.2em] text-sm">
            <span className="text-primary">CODE.</span>{' '}
            <span className="text-mafia">DECEIVE.</span>{' '}
            <span className="text-gray-300">DEPLOY.</span>
          </div>

          {/* Username card */}
          <PixelCard title="ENTER YOUR CODENAME" className="w-full mt-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              placeholder="e.g. ANTHOS"
              className="w-full bg-black border-2 border-[#2a2a2a] p-3 font-mono text-white text-lg uppercase focus:border-primary focus:outline-none transition-colors mb-4"
              maxLength={15}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            />

            {/* Color picker */}
            <div className="mb-4">
              <div className="font-tech text-xs text-gray-400 mb-2">CHOOSE YOUR COLOR:</div>
              <div className="flex flex-wrap gap-2">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 border-2 transition-all ${
                      selectedColor === color
                        ? 'border-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                        : 'border-[#2a2a2a] hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-mafia text-xs font-mono mb-3 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <GameButton
              variant="success"
              icon={<ArrowRight size={18} />}
              onClick={handleContinue}
            >
              CONTINUE
            </GameButton>
          </PixelCard>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER — Main Home screen (Step 2)
  // ──────────────────────────────────────────────
  return (
    <div className="w-full flex-1 min-h-screen flex flex-col p-4 relative text-textMain">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg.jpg')" }}
      />

      {/* Top Header */}
      <header className="flex justify-between items-center w-full z-10 p-2 relative">
        <div className="flex gap-2">
          <button className="p-3 bg-panel border-4 border-panelBorder hover:border-primary transition-colors text-textMuted hover:text-white">
            <Settings size={20} />
          </button>
        </div>
        {/* Show current username */}
        <div className="flex items-center gap-3 z-10">
          <div
            className="w-4 h-4 border border-white/30"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="font-tech text-sm text-gray-300">{username}</span>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-panel border-4 border-panelBorder hover:border-primary transition-colors text-textMuted hover:text-white">
            <HelpCircle size={20} />
          </button>
          <button className="p-3 bg-panel border-4 border-panelBorder hover:border-primary transition-colors text-textMuted hover:text-white">
            <Trophy size={20} />
          </button>
          <button className="p-3 bg-panel border-4 border-panelBorder hover:border-primary transition-colors text-textMuted hover:text-white">
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex w-full max-w-7xl mx-auto z-10 gap-8 mt-4 relative">
        {/* Left Column */}
        <div className="w-[300px] flex flex-col gap-6 hidden md:flex">
          <PixelCard title="HOW TO PLAY" className="text-sm">
            <ul className="space-y-4 font-tech">
              <li className="flex gap-3 items-start">
                <span className="text-primary mt-1"><Users size={16} /></span>
                <span><strong className="text-white">Developers:</strong> Complete all tasks to win.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-mafia mt-1"><ShieldAlert size={16} /></span>
                <span><strong className="text-white">Mafia:</strong> Sabotage and stop the deployment.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-textMuted mt-1"><Megaphone size={16} /></span>
                <span>Call meetings, discuss, and vote out suspects.</span>
              </li>
              <li className="flex gap-3 items-start text-mafia mt-4">
                <AlertCircle size={16} className="mt-0.5" />
                <span className="font-bold">Trust no one.</span>
              </li>
            </ul>
          </PixelCard>

          <PixelCard title="FEATURES" className="text-sm">
            <ul className="space-y-3 font-tech text-gray-300">
              <li className="flex gap-3 items-center"><Users size={14} className="text-gray-500" /> Secret Roles</li>
              <li className="flex gap-3 items-center"><CheckSquare size={14} className="text-success" /> Task System</li>
              <li className="flex gap-3 items-center"><ShieldAlert size={14} className="text-mafia" /> Sabotages</li>
              <li className="flex gap-3 items-center"><MessageSquareWarning size={14} className="text-warning" /> Emergency Meetings</li>
              <li className="flex gap-3 items-center"><CheckSquare size={14} className="text-gray-500" /> Voting System</li>
            </ul>
          </PixelCard>
        </div>

        {/* Center Column — Hero & Controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-center mb-8 mt-4">
            <h1 className="font-pixel text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] leading-tight whitespace-nowrap">
              &lt;<span className="text-[#0066FF]">AMONG</span>{' '}
              <span className="text-mafia">DEVS</span>&gt;
            </h1>
            <div className="inline-block border-2 border-panelBorder bg-panel/80 px-6 py-2 mt-4 font-mono font-bold tracking-[0.2em] text-sm">
              <span className="text-primary">CODE.</span>{' '}
              <span className="text-mafia">DECEIVE.</span>{' '}
              <span className="text-gray-300">DEPLOY.</span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="w-full max-w-sm mb-4 bg-mafia/10 border-2 border-mafia p-3 text-mafia text-xs font-mono flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="w-full max-w-sm flex flex-col gap-4 mt-2 bg-panel/50 p-6 border-4 border-[#1a233a] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <GameButton
              variant="success"
              icon={isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              onClick={handleCreateRoom}
              disabled={isCreating || isJoining}
            >
              {isCreating ? 'CREATING...' : 'CREATE ROOM'}
            </GameButton>

            <GameButton
              variant="primary"
              icon={<LogIn size={18} />}
              onClick={() => document.getElementById('room-code-input')?.focus()}
              disabled={isCreating || isJoining}
            >
              JOIN ROOM
            </GameButton>

            <GameButton
              variant="purple"
              icon={isCreating ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              onClick={handleQuickPlay}
              disabled={isCreating || isJoining}
            >
              {isCreating ? 'CREATING...' : 'QUICK PLAY'}
            </GameButton>

            <GameButton
              variant="ghost"
              icon={<BookOpen size={18} className="text-textMuted" />}
              className="mt-2 text-xs py-2"
            >
              TUTORIAL
            </GameButton>
          </div>

          {/* Room code input */}
          <div className="w-full max-w-sm mt-8 border-2 border-warning/50 bg-[#110e05] p-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 text-[8px] font-pixel text-warning px-2 py-1">
              HAVE A ROOM CODE?
            </div>
            <div className="flex mt-4 gap-2 p-2">
              <input
                id="room-code-input"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE..."
                className="flex-1 bg-black border-2 border-[#2a2a2a] p-3 font-mono text-white text-lg uppercase focus:border-warning focus:outline-none transition-colors"
                maxLength={5}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !roomCode.trim()}
                className="bg-[#2a2a2a] hover:bg-warning hover:text-black transition-colors border-2 border-[#3a3a3a] px-4 flex items-center justify-center text-white disabled:opacity-50"
              >
                {isJoining ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[300px] flex flex-col gap-6 hidden lg:flex">
          <PixelCard title="NEWS FEED" className="text-sm" variant="success">
            <ul className="space-y-3 font-mono text-xs text-gray-400">
              <li><span className="text-success">v0.1.3</span> - Secret Roles</li>
              <li><span className="text-success">v0.1.2</span> - New Sabotages</li>
              <li><span className="text-success">v0.1.1</span> - Bug Fixes</li>
              <li><span className="text-success">v0.1.0</span> - Initial Commit</li>
              <li>...</li>
            </ul>
          </PixelCard>

          <PixelCard title="JOIN DISCORD" variant="highlight" className="text-sm bg-[#1e1a2b]">
            <div className="flex gap-4 items-center mb-4">
              <div className="bg-[#5865F2] p-3 rounded-lg">
                <DiscordIcon size={24} className="text-white" />
              </div>
              <p className="text-xs text-gray-300 font-tech">
                Find teammates, share strategies, and stay updated!
              </p>
            </div>
            <GameButton variant="purple" className="py-2 text-xs">
              JOIN NOW
            </GameButton>
          </PixelCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center w-full z-10 p-2 font-mono text-[10px] text-gray-500 tracking-widest mt-auto relative">
        <div>v0.1.3 - ALPHA</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#00F0FF]" />
          23 PLAYERS ONLINE
        </div>
      </footer>
    </div>
  );
}
