/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // パレット生値（custom 用途時の fallback）
        paper: {
          50: '#FAF5EC',
          100: '#F2EADB',
          200: '#E8DFCB',
          300: '#D2C3A2',
          400: '#A89B87',
        },
        ink: {
          900: '#262320',
          700: '#4A4339',
          500: '#7E7466',
        },
        persimmon: {
          50: '#F9E0D1',
          500: '#E07856',
          600: '#C9623F',
          700: '#B54A2B',
        },
        forest: {
          50: '#DDE5DC',
          600: '#3E5A46',
          700: '#324A3A',
        },

        // セマンティック（コンポーネントからはこちらを参照）
        bg: '#FAF5EC',
        'bg-subtle': '#F2EADB',
        surface: '#FFFFFF',
        border: { DEFAULT: '#E8DFCB', strong: '#D2C3A2' },
        grid: '#EDE2CB',
        text: { DEFAULT: '#262320', muted: '#7E7466', subtle: '#A89B87' },
        primary: { DEFAULT: '#E07856', hover: '#C9623F', soft: '#F9E0D1' },
        accent: { DEFAULT: '#3E5A46', hover: '#324A3A', soft: '#DDE5DC' },
        danger: { DEFAULT: '#B54A2B', soft: '#F6DED3' },
        sunday: '#B54A2B',
        saturday: '#3F5A78',
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          '"Meiryo"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          '"SFMono-Regular"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(40,30,20,0.04), 0 2px 8px rgba(40,30,20,0.04)',
        raised: '0 4px 16px rgba(40,30,20,0.08)',
      },
      ringColor: {
        DEFAULT: 'rgba(224,120,86,0.35)',
      },
    },
  },
  plugins: [],
}
