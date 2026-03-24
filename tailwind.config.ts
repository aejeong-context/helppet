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
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd48c',
          300: '#fbc35f',
          400: '#fab63d',
          500: '#f9a825',
          600: '#f59b20',
          700: '#ef8b1a',
          800: '#e97c15',
          900: '#df620c',
        },
        warm: {
          50: '#fdf8f0',
          100: '#f8ece0',
          200: '#f0d6be',
          300: '#e8c09c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
