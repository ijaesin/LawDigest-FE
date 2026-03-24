import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Home, Settings, Bell, User } from 'lucide-react';
import { NavItem } from '@/app/common/components/molecules/NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'Molecules/NavItem',
  component: NavItem,
  argTypes: {
    active: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof NavItem>;

export const Active: Story = {
  args: { icon: Home, label: 'Dashboard', href: '/', active: true },
};

export const Inactive: Story = {
  args: { icon: Settings, label: 'Settings', href: '/settings', active: false },
};

export const Compact: Story = {
  args: { icon: Bell, label: 'Notifications', href: '/notifications', compact: true },
};

export const AsButton: Story = {
  args: { icon: User, label: 'Profile', onClick: () => alert('clicked') },
};
