import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(ts|tsx)',
    '../app/**/*.stories.@(ts|tsx)',
    '../app/**/components/**/*.stories.@(ts|tsx)',
    '../app/common/components/**/*.stories.@(ts|tsx)',
  ],

  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: '../next.config.js',
    },
  }
};

export default config;
