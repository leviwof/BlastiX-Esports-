import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elev) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elev) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          2: 'rgb(var(--primary-2) / <alpha-value>)',
          foreground: 'rgb(var(--bg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        foreground: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          soft: 'rgb(var(--text-soft) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--surface-2) / <alpha-value>)',
          foreground: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--surface-elev) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--surface-2) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(var(--bg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          foreground: 'rgb(var(--bg) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          foreground: 'rgb(var(--text) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          foreground: 'rgb(var(--bg) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / 0.18)',
        input: 'rgb(var(--border) / 0.22)',
        ring: 'rgb(var(--ring) / 0.55)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Chakra Petch"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(17, 251, 190, 0.18)',
        'glow-md': '0 0 28px rgba(17, 251, 190, 0.30)',
        'glow-strong': '0 0 42px rgba(17, 251, 190, 0.45)',
        'glow-gold': '0 0 26px rgba(255, 186, 0, 0.32)',
        'glow-danger': '0 0 26px rgba(255, 70, 85, 0.35)',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.15)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [animate],
};
