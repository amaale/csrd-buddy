import type { Config } from 'tailwindcss';

const config: Config = {
  // 1. Dì a Tailwind dove cercare CSS classes nel tuo progetto
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', 
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // qui puoi mettere colori custom, font, ecc.
    },
  },
  // 2. Aggiungi qui i plugin che vuoi usare
  plugins: [
    require('daisyui'),
    // form styles (inputs, select, checkbox… già belli pronti)
    require('@tailwindcss/forms'),
    // tipografia avanzata (prose, heading styling…)
    require('@tailwindcss/typography'),
    // line clamp (troncamento testi con “…”)
    require('@tailwindcss/line-clamp'),
  ],
};

export default config;
