/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: '#A34F37',
        bronze: '#C5A352',
        parchment: '#F5F5DC',
        ink: '#1B1E21',
      },
      fontFamily: {
        serifHead: ['"EB Garamond"', 'Georgia', 'serif'],
        sansBody: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        carved: '0 10px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)',
        'carved-inset': 'inset 0 2px 6px rgba(0,0,0,0.08), inset 0 -2px 4px rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        moorish: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><defs><pattern id=\"p\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M20 0v40M0 20h40\" stroke=\"%23e8e2c9\" stroke-width=\"1\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"%23F5F5DC\"/><rect width=\"100%\" height=\"100%\" fill=\"url(%23p)\"/></svg>')",
      },
    },
  },
  plugins: [],
};
