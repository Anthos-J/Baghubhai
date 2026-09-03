export interface PlayerSettings {
  controls: {
    moveUp: string;
    moveDown: string;
    moveLeft: string;
    moveRight: string;
    interact: string;
    emergencyMeeting: string;
    map: string;
    cancel: string;
  };
  audio: {
    masterVolume: number; // 0 - 100
    musicVolume: number; // 0 - 100
    sfxVolume: number; // 0 - 100
    muteAll: boolean;
  };
  display: {
    fullscreen: boolean;
    screenShake: boolean;
    showFps: boolean;
  };
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  controls: {
    moveUp: 'W',
    moveDown: 'S',
    moveLeft: 'A',
    moveRight: 'D',
    interact: 'E',
    emergencyMeeting: 'R',
    map: 'M',
    cancel: 'ESC',
  },
  audio: {
    masterVolume: 100,
    musicVolume: 70,
    sfxVolume: 80,
    muteAll: false,
  },
  display: {
    fullscreen: false,
    screenShake: true,
    showFps: false,
  },
};

const STORAGE_KEY = 'among_devs_player_settings';

export function getPlayerSettings(): PlayerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      controls: { ...DEFAULT_PLAYER_SETTINGS.controls, ...(parsed.controls || {}) },
      audio: { ...DEFAULT_PLAYER_SETTINGS.audio, ...(parsed.audio || {}) },
      display: { ...DEFAULT_PLAYER_SETTINGS.display, ...(parsed.display || {}) },
    };
  } catch {
    return DEFAULT_PLAYER_SETTINGS;
  }
}

export function savePlayerSettings(settings: PlayerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyAudioSettings(settings.audio);
    applyDisplaySettings(settings.display);
  } catch (err) {
    console.warn('Could not save player settings to localStorage:', err);
  }
}

export function resetPlayerSettings(): PlayerSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not reset player settings:', err);
  }
  return DEFAULT_PLAYER_SETTINGS;
}

export function applyAudioSettings(audio: PlayerSettings['audio']): void {
  // Sync volume state to any HTMLAudioElements or background videos/music
  const effectiveVolume = audio.muteAll ? 0 : (audio.masterVolume / 100) * (audio.musicVolume / 100);
  const mediaElements = document.querySelectorAll('audio, video');
  mediaElements.forEach((el) => {
    try {
      (el as HTMLMediaElement).volume = Math.max(0, Math.min(1, effectiveVolume));
      (el as HTMLMediaElement).muted = audio.muteAll;
    } catch {
      // Ignore media volume error if browser restricts
    }
  });
}

export function applyDisplaySettings(display: PlayerSettings['display']): void {
  if (display.fullscreen) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}
