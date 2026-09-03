import React, { useState, useEffect } from 'react';
import { GameSettings, CodeDifficulty } from '../../types/game';
import { Settings, X, RotateCcw, Check, Users, Clock, AlertTriangle, Skull, Lock } from 'lucide-react';

interface LobbySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  isHost: boolean;
  onSaveSettings: (settings: GameSettings) => void;
}

export const LobbySettingsModal: React.FC<LobbySettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  isHost,
  onSaveSettings,
}) => {
  const [draft, setDraft] = useState<GameSettings>(currentSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft whenever currentSettings changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(currentSettings);
      setSaveSuccess(false);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleMaxPlayersChange = (newMax: number) => {
    let nextMafia = draft.mafiaCount ?? 1;
    if (newMax <= 6 && nextMafia > 1) {
      nextMafia = 1;
    }
    setDraft((prev) => ({
      ...prev,
      maxPlayers: newMax,
      mafiaCount: nextMafia,
    }));
  };

  const handleReset = () => {
    setDraft(currentSettings);
  };

  const handleSave = () => {
    if (!isHost) return;

    // Normalization & Validation
    const normalizedMaxPlayers = Math.max(4, Math.min(10, draft.maxPlayers ?? 5));
    const maxMafiaAllowed = normalizedMaxPlayers <= 6 ? 1 : 2;
    const normalizedMafiaCount = Math.max(1, Math.min(maxMafiaAllowed, draft.mafiaCount ?? 1));

    const finalSettings: GameSettings = {
      maxPlayers: normalizedMaxPlayers,
      mafiaCount: normalizedMafiaCount,
      difficulty: draft.difficulty || 'MEDIUM',
      gameDurationSeconds: Math.max(600, Math.min(1200, draft.gameDurationSeconds ?? 900)),
      discussionDurationSeconds: Math.max(30, Math.min(180, draft.discussionDurationSeconds ?? 180)),
      votingDurationSeconds: Math.max(30, Math.min(180, draft.votingDurationSeconds ?? 60)),
      emergencyMeetingLimit: draft.emergencyMeetingLimit === undefined ? 1 : draft.emergencyMeetingLimit,
      emergencyMeetingCooldownSeconds: Math.max(15, Math.min(90, draft.emergencyMeetingCooldownSeconds ?? 30)),
      sabotageCooldownSeconds: Math.max(30, Math.min(90, draft.sabotageCooldownSeconds ?? 45)),
      syntaxBlackoutDurationSeconds: Math.max(5, Math.min(30, draft.syntaxBlackoutDurationSeconds ?? 10)),
      imposterEscapeDelaySeconds: Math.max(0, Math.min(10, draft.imposterEscapeDelaySeconds ?? 5)),
    };

    onSaveSettings(finalSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const maxPlayersVal = draft.maxPlayers ?? 5;
  const mafiaCountVal = draft.mafiaCount ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-panel/95 border-2 border-primary/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panelBorder flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech tracking-wider text-white flex items-center gap-2">
                GAME SETTINGS
                {!isHost && (
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-normal flex items-center gap-1">
                    <Lock size={12} /> READ ONLY — HOST CONTROLS SETTINGS
                  </span>
                )}
              </h2>
              <p className="text-xs text-textMuted font-mono">
                {isHost ? 'Configure lobby match rules and timers' : 'Current host game configuration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-textMuted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-sm">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 flex items-center gap-2 font-mono text-xs">
              <Check className="w-4 h-4" /> GAME SETTINGS SAVED & BROADCASTED
            </div>
          )}

          {/* Section 1: PLAYERS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <Users className="w-4 h-4" /> PLAYERS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Players */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Max Players {!isHost && <Lock size={10} />}</span>
                  <span className="text-primary font-bold">{maxPlayersVal}</span>
                </label>
                <select
                  disabled={!isHost}
                  value={maxPlayersVal}
                  onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {[4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} Players
                    </option>
                  ))}
                </select>
              </div>

              {/* Mafia Count */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Mafia Count {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">{mafiaCountVal} Mafia</span>
                </label>
                <select
                  disabled={!isHost}
                  value={mafiaCountVal}
                  onChange={(e) => setDraft({ ...draft, mafiaCount: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value={1}>1 Mafia (All sizes)</option>
                  {maxPlayersVal >= 7 && <option value={2}>2 Mafia (7-10 players)</option>}
                </select>
                {maxPlayersVal < 7 && (
                  <span className="text-[10px] text-textMuted mt-1">2 Mafia requires 7+ max players</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: GAMEPLAY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <Clock className="w-4 h-4" /> GAMEPLAY
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Coding Difficulty {!isHost && <Lock size={10} />}</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['SMALL', 'MEDIUM', 'DIFFICULT'] as CodeDifficulty[]).map((diff) => {
                    const label = diff === 'SMALL' ? 'EASY' : diff === 'MEDIUM' ? 'MEDIUM' : 'HARD';
                    const active = draft.difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        disabled={!isHost}
                        onClick={() => setDraft({ ...draft, difficulty: diff })}
                        className={`py-1 text-xs font-tech rounded border transition-all ${
                          active
                            ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'bg-black/40 border-panelBorder text-textMuted hover:text-white'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Game Duration */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Game Duration {!isHost && <Lock size={10} />}</span>
                  <span className="text-primary font-bold">{Math.round((draft.gameDurationSeconds ?? 900) / 60)} min</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.gameDurationSeconds ?? 900}
                  onChange={(e) => setDraft({ ...draft, gameDurationSeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((m) => (
                    <option key={m} value={m * 60}>
                      {m} Minutes ({m * 60}s)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: MEETING */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <AlertTriangle className="w-4 h-4" /> MEETING & EMERGENCY
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discussion Time */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Discussion Time {!isHost && <Lock size={10} />}</span>
                  <span className="text-primary font-bold">{draft.discussionDurationSeconds}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.discussionDurationSeconds}
                  onChange={(e) => setDraft({ ...draft, discussionDurationSeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {[30, 60, 90, 120, 150, 180].map((s) => (
                    <option key={s} value={s}>
                      {s} Seconds {s === 180 ? '(3 min)' : s === 120 ? '(2 min)' : s === 60 ? '(1 min)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voting Time */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Voting Time {!isHost && <Lock size={10} />}</span>
                  <span className="text-primary font-bold">{draft.votingDurationSeconds}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.votingDurationSeconds}
                  onChange={(e) => setDraft({ ...draft, votingDurationSeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {[30, 60, 90, 120, 150, 180].map((s) => (
                    <option key={s} value={s}>
                      {s} Seconds {s === 60 ? '(1 min)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency Meeting Limit */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Emergency Meetings {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">
                    {draft.emergencyMeetingLimit === null ? 'UNLIMITED' : `${draft.emergencyMeetingLimit} / PLAYER`}
                  </span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.emergencyMeetingLimit === null ? 'null' : String(draft.emergencyMeetingLimit ?? 1)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      emergencyMeetingLimit: e.target.value === 'null' ? null : (Number(e.target.value) as 1 | 2),
                    })
                  }
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="1">1 / PLAYER (Default)</option>
                  <option value="2">2 / PLAYER</option>
                  <option value="null">UNLIMITED</option>
                </select>
              </div>

              {/* Emergency Meeting Cooldown */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Emergency Cooldown {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">{draft.emergencyMeetingCooldownSeconds ?? 30}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.emergencyMeetingCooldownSeconds ?? 30}
                  onChange={(e) =>
                    setDraft({ ...draft, emergencyMeetingCooldownSeconds: Number(e.target.value) })
                  }
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {[15, 30, 45, 60, 90].map((s) => (
                    <option key={s} value={s}>
                      {s} Seconds Cooldown
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: MAFIA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <Skull className="w-4 h-4" /> MAFIA / SABOTAGE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sabotage Cooldown */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Sabotage Cooldown {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">{draft.sabotageCooldownSeconds}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.sabotageCooldownSeconds}
                  onChange={(e) => setDraft({ ...draft, sabotageCooldownSeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                >
                  {[30, 45, 60, 75, 90].map((s) => (
                    <option key={s} value={s}>
                      {s}s
                    </option>
                  ))}
                </select>
              </div>

              {/* Syntax Blackout Duration */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Syntax Blackout {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">{draft.syntaxBlackoutDurationSeconds}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.syntaxBlackoutDurationSeconds}
                  onChange={(e) => setDraft({ ...draft, syntaxBlackoutDurationSeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                >
                  {[5, 10, 15, 20, 30].map((s) => (
                    <option key={s} value={s}>
                      {s}s
                    </option>
                  ))}
                </select>
              </div>

              {/* Escape Delay */}
              <div className="bg-black/30 p-3 rounded-lg border border-panelBorder flex flex-col justify-between">
                <label className="text-xs text-textMuted mb-1 flex justify-between items-center">
                  <span className="flex items-center gap-1">Escape Delay {!isHost && <Lock size={10} />}</span>
                  <span className="text-accent font-bold">{draft.imposterEscapeDelaySeconds}s</span>
                </label>
                <select
                  disabled={!isHost}
                  value={draft.imposterEscapeDelaySeconds}
                  onChange={(e) => setDraft({ ...draft, imposterEscapeDelaySeconds: Number(e.target.value) })}
                  className="bg-black/60 border border-panelBorder rounded px-3 py-1.5 text-white font-tech focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                >
                  {[0, 3, 5, 7, 10].map((s) => (
                    <option key={s} value={s}>
                      {s === 0 ? '0s (Immediate)' : `${s}s`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-panelBorder flex justify-between items-center bg-black/40">
          <div>
            {isHost && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-panelBorder text-textMuted hover:text-white font-tech text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> RESET DRAFT
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 border border-panelBorder text-textMuted hover:text-white font-tech text-xs transition-colors"
            >
              {isHost ? 'CANCEL' : 'CLOSE'}
            </button>
            {isHost && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-black font-tech font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              >
                <Check className="w-4 h-4" /> SAVE SETTINGS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
