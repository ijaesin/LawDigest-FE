import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from '@/app/common/components/Layout/SideNav/SideNav';

const meta: Meta<typeof SideNav> = {
  title: 'Patterns/SideNav',
  component: SideNav,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SideNav>;

export const Full: Story = { args: { compact: false } };
export const Compact: Story = { args: { compact: true } };
