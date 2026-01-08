/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Chivo', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#09090B',
        foreground: '#EDEDED',
        card: '#121214',
        'card-foreground': '#EDEDED',
        popover: '#121214',
        'popover-foreground': '#EDEDED',
        primary: '#EDEDED',
        'primary-foreground': '#09090B',
        secondary: '#A1A1AA',
        'secondary-foreground': '#09090B',
        muted: '#18181B',
        'muted-foreground': '#A1A1AA',
        accent: '#18181B',
        'accent-foreground': '#EDEDED',
        destructive: '#F87171',
        'destructive-foreground': '#EDEDED',
        border: '#27272A',
        input: '#27272A',
        ring: '#3F3F46',
        'log-error': '#F87171',
        'log-warn': '#FBBF24',
        'log-info': '#60A5FA',
        'log-debug': '#A78BFA',
        'log-success': '#34D399',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}