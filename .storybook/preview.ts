import { definePreview } from '@storybook/nextjs-vite';

import '../styles/globals.css';

export default definePreview({
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffff' },
        dark: { name: 'dark', value: '#0a0a0a' },
      },
    },
  },
  initialGlobals: {
    backgrounds: {
      value: 'light',
    },
  },
});
