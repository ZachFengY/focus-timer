const { colorTokens, spacing, radius } = require('./node_modules/@focusflow/ui/src/theme/tokens')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map design tokens to Tailwind class names
        // Usage: className="bg-page text-primary border-subtle"
        page: 'var(--color-bg-page)',
        card: 'var(--color-bg-card)',
        elevated: 'var(--color-bg-elevated)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        subtle: 'var(--color-border-subtle)',
        indigo: 'var(--color-accent-indigo)',
        green: 'var(--color-accent-green)',
        coral: 'var(--color-accent-coral)',
        amber: 'var(--color-accent-amber)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '36px',
      },
      fontFamily: {
        display: ['Fraunces-SemiBold'],
        body: ['DMSans-Regular'],
        'body-medium': ['DMSans-Medium'],
        'body-semibold': ['DMSans-SemiBold'],
        'body-bold': ['DMSans-Bold'],
        mono: ['Inter'],
      },
    },
  },
  plugins: [],
}
