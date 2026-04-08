import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#898989',
          500: '#242424',
          600: '#1a1a1a',
          700: '#111111',
          800: '#0a0a0a',
          900: '#000000',
        },
        warm: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#898989',
          400: '#6b6b6b',
          500: '#525252',
          600: '#3a3a3a',
          700: '#242424',
        },
        accent: {
          blue: '#0099ff',
          focus: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'cal': 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px',
        'cal-lg': 'rgba(36,36,36,0.7) 0px 1px 5px -4px, rgba(36,36,36,0.05) 0px 4px 8px',
        'cal-btn': 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px',
        'cal-soft': 'rgba(34,42,53,0.05) 0px 4px 8px',
      },
    },
  },
  plugins: [],
};

export default config;
