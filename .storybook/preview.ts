import type { Preview, ReactRenderer } from '@storybook/react';
import type { DecoratorFunction } from '@storybook/types';
import React from 'react';

import '../styles/globals.css';

const withDarkMode: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const isDark =
    context.globals?.backgrounds?.value === '#0a0a0a' || context.parameters?.backgrounds?.default === 'dark';
  return React.createElement(
    'div',
    { className: isDark ? 'dark' : '' },
    React.createElement(
      'div',
      { className: 'bg-background text-foreground min-h-screen p-4' },
      React.createElement(Story),
    ),
  );
};

const preview: Preview = {
  decorators: [withDarkMode],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
};

export default preview;
