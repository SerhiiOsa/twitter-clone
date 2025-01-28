import daisyui from 'daisyui';
import daisyUIThemes from 'daisyui/src/theming/themes';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // Головний HTML-файл
    './src/**/*.{js,ts,jsx,tsx}', // Файли в папці src
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      'light',
      {
        black: {
          ...daisyUIThemes['black'],
          primary: 'rgb(29, 155, 240)',
          secondary: 'rgb(24, 24, 24)',
        },
      },
    ],
  },
};
