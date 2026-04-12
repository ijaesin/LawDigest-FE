import type { Meta, StoryObj } from '@storybook/react';
import { Mail } from 'lucide-react';
import { NotificationBadge } from '@/app/common/components/molecules/NotificationBadge';

const meta: Meta<typeof NotificationBadge> = {
  title: 'Molecules/NotificationBadge',
  component: NotificationBadge,
};
export default meta;
type Story = StoryObj<typeof NotificationBadge>;

export const Default: Story = {
  args: { count: 0 },
};

export const WithCount: Story = {
  args: { count: 5 },
};

export const OverflowCount: Story = {
  args: { count: 150 },
};

export const CustomIcon: Story = {
  args: { count: 3, icon: <Mail className="h-5 w-5 text-muted-foreground" /> },
};
