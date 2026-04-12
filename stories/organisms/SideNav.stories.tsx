import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from '@/app/common/components/organisms';

const meta: Meta<typeof SideNav> = {
  title: 'Organisms/SideNav',
  component: SideNav,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof SideNav>;

export const Default: Story = {};

export const Compact: Story = {
  args: { compact: true },
};
