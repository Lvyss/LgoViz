import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pixel theme colors
        'pixel-dark': '#0a0a0f',
        'pixel-darker': '#0f0f1a',
        'pixel-panel': '#13131f',
        'pixel-highlight': '#1a1a2e',
        'neon-green': '#00ff88',
        'neon-blue': '#00d4ff',
        'neon-purple': '#b44fff',
        'neon-yellow': '#ffdd00',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['VT323', '"Courier New"', 'monospace'],
      },
      animation: {
        'pixel-blink': 'blink 1s step-end infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '50%': { textShadow: '0 0 15px #00ff88, 0 0 25px #00ff88' },
        },
      },
    },
  },
  plugins: [],
};

export default config;