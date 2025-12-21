import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(ts|tsx)',
    '../app/**/*.stories.@(ts|tsx)',
    '../app/**/components/**/*.stories.@(ts|tsx)',
    '../app/common/components/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.js',
    },
  },
  docs: {
    autodocs: true,
  },
};

export default config;
