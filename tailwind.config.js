/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#060913',
        panel: '#0B101E',
        panelBorder: '#1A233A',
        primary: '#00F0FF',
        primaryDark: '#007ACC',
        mafia: '#FF003C',
        mafiaDark: '#990024',
        success: '#00FF66',
        warning: '#FFB800',
        purple: '#9D00FF',
        textMain: '#E0E7FF',
        textMuted: '#6B7280',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        tech: ['"Share Tech Mono"', 'monospace'],
        mono: ['"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 10px rgba(0, 240, 255, 0.5)',
        'glow-mafia': '0 0 10px rgba(255, 0, 60, 0.5)',
        'glow-success': '0 0 10px rgba(0, 255, 102, 0.5)',
      },
    },
  },
  plugins: [],
}
