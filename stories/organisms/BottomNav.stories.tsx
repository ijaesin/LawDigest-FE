import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from '@/app/common/components/organisms';

const meta: Meta<typeof BottomNav> = {
  title: 'Organisms/BottomNav',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {};
