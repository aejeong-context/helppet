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
          50: '#f2f9ff',
          100: '#e0f0ff',
          200: '#b3d9ff',
          300: '#62aef0',
          400: '#097fe8',
          500: '#0075de',
          600: '#005bab',
          700: '#004a8c',
          800: '#213183',
          900: '#1a2560',
        },
        warm: {
          50: '#fafaf9',
          100: '#f6f5f4',
          200: '#eeedeb',
          300: '#a39e98',
          400: '#7a7672',
          500: '#615d59',
          600: '#474441',
          700: '#31302e',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0px 4px 18px rgba(0,0,0,0.04), 0px 2px 7.85px rgba(0,0,0,0.027), 0px 0.8px 2.93px rgba(0,0,0,0.02), 0px 0.175px 1.04px rgba(0,0,0,0.01)',
        'notion-lg': '0px 1px 3px rgba(0,0,0,0.01), 0px 3px 7px rgba(0,0,0,0.02), 0px 7px 15px rgba(0,0,0,0.02), 0px 14px 28px rgba(0,0,0,0.04), 0px 23px 52px rgba(0,0,0,0.05)',
      },
      borderColor: {
        DEFAULT: 'rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
