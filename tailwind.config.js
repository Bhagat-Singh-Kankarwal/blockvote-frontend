export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a5b4fc',
        secondary: '#fae8ff',
        accent: '#ddd6fe',
        background: '#f5f3ff',
      },
      fontFamily: {
        'instrument': ['InstrumentSerif', 'serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
        'oldStandard': ['OldStandard', 'serif'],
      }
    },
  },
  plugins: [],
}