import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#14202B', rail: '#0E2A3B', brand: { DEFAULT: '#0F766E', dark: '#0B5A54', soft: '#E1F2F0' }, canvas: '#F2F5F7', line: '#D9E0E6' },
      fontFamily: { sans: ['var(--font-plex)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
