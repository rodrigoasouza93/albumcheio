import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0F172A',
        danger: '#E11D48',
        gold: '#F59E0B',
        ink: '#1E293B',
        ocean: '#059669',
        paper: '#F8FAFC',
        line: '#D9E2DF'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
