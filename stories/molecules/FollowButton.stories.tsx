import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { FollowButton } from '@/app/common/components/molecules/FollowButton';

const meta: Meta<typeof FollowButton> = {
  title: 'Molecules/FollowButton',
  component: FollowButton,
  args: {
    onToggle: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof FollowButton>;

export const NotFollowing: Story = {
  args: { isFollowing: false },
};

export const Following: Story = {
  args: { isFollowing: true },
};

export const WithCount: Story = {
  args: { isFollowing: false, count: 42 },
};

export const SmallSize: Story = {
  args: { isFollowing: false, size: 'sm' },
};
