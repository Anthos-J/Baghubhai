import React, { useState, useEffect } from 'react';
import {
  PlayerSettings,
  DEFAULT_PLAYER_SETTINGS,
  getPlayerSettings,
  savePlayerSettings,
  resetPlayerSettings,
} from '../../lib/playerSettings';
import { Settings, X, RotateCcw, Check, Gamepad2, Volume2, Monitor, VolumeX } from 'lucide-react';

interface HomeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HomeSettingsModal: React.FC<HomeSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<PlayerSettings>(getPlayerSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getPlayerSettings());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaultSettings = resetPlayerSettings();
    setSettings(defaultSettings);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    savePlayerSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-panel/95 border-2 border-primary/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panelBorder flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech tracking-wider text-white">
                SETTINGS
              </h2>
              <p className="text-xs text-textMuted font-mono">
                YOUR PERSONAL SETTINGS
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
          {savedSuccess && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 flex items-center gap-2 font-mono text-xs">
              <Check className="w-4 h-4" /> SETTINGS SAVED LOCALLY
            </div>
          )}

          {/* Section 1: CONTROLS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <Gamepad2 className="w-4 h-4" /> 🎮 CONTROLS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Move Up</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-primary font-bold">
                  {settings.controls.moveUp}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Move Down</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-primary font-bold">
                  {settings.controls.moveDown}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Move Left</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-primary font-bold">
                  {settings.controls.moveLeft}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Move Right</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-primary font-bold">
                  {settings.controls.moveRight}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Interact</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-primary font-bold">
                  {settings.controls.interact}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Emergency Meeting</span>
                <span className="px-2 py-0.5 bg-white/10 border border-panelBorder rounded text-accent font-bold">
                  {settings.controls.emergencyMeeting}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: AUDIO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> 🔊 AUDIO
              </span>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    audio: { ...settings.audio, muteAll: !settings.audio.muteAll },
                  })
                }
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  settings.audio.muteAll
                    ? 'bg-mafia/20 border-mafia text-mafia'
                    : 'bg-black/40 border-panelBorder text-gray-400 hover:text-white'
                }`}
              >
                {settings.audio.muteAll ? <VolumeX size={12} /> : <Volume2 size={12} />}
                MUTE ALL: [{settings.audio.muteAll ? 'ON' : 'OFF'}]
              </button>
            </div>

            <div className="space-y-3 text-xs bg-black/30 p-3 rounded border border-panelBorder">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Master Volume</span>
                  <span className="text-primary font-bold">{settings.audio.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.masterVolume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      audio: { ...settings.audio, masterVolume: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00F0FF] bg-black/50 cursor-pointer h-1.5 rounded"
                />
              </div>

              {/* Music Volume */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Music Volume</span>
                  <span className="text-primary font-bold">{settings.audio.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.musicVolume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      audio: { ...settings.audio, musicVolume: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00F0FF] bg-black/50 cursor-pointer h-1.5 rounded"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>SFX Volume</span>
                  <span className="text-primary font-bold">{settings.audio.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.audio.sfxVolume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      audio: { ...settings.audio, sfxVolume: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00F0FF] bg-black/50 cursor-pointer h-1.5 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section 3: DISPLAY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs border-b border-panelBorder pb-1">
              <Monitor className="w-4 h-4" /> 🖥 DISPLAY
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Fullscreen</span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, fullscreen: !settings.display.fullscreen },
                    })
                  }
                  className={`px-3 py-1 font-tech rounded border transition-colors ${
                    settings.display.fullscreen
                      ? 'bg-primary/20 border-primary text-primary font-bold'
                      : 'bg-black/40 border-panelBorder text-gray-400 hover:text-white'
                  }`}
                >
                  [{settings.display.fullscreen ? 'ON' : 'OFF'}]
                </button>
              </div>

              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Screen Shake</span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, screenShake: !settings.display.screenShake },
                    })
                  }
                  className={`px-3 py-1 font-tech rounded border transition-colors ${
                    settings.display.screenShake
                      ? 'bg-primary/20 border-primary text-primary font-bold'
                      : 'bg-black/40 border-panelBorder text-gray-400 hover:text-white'
                  }`}
                >
                  [{settings.display.screenShake ? 'ON' : 'OFF'}]
                </button>
              </div>

              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-panelBorder">
                <span className="text-gray-300">Show FPS</span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, showFps: !settings.display.showFps },
                    })
                  }
                  className={`px-3 py-1 font-tech rounded border transition-colors ${
                    settings.display.showFps
                      ? 'bg-primary/20 border-primary text-primary font-bold'
                      : 'bg-black/40 border-panelBorder text-gray-400 hover:text-white'
                  }`}
                >
                  [{settings.display.showFps ? 'ON' : 'OFF'}]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-panelBorder flex justify-between items-center bg-black/40">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-panelBorder text-textMuted hover:text-white font-tech text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 border border-panelBorder text-textMuted hover:text-white font-tech text-xs transition-colors"
            >
              CLOSE
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-black font-tech font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
            >
              <Check className="w-4 h-4" /> SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
