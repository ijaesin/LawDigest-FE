import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ActionBar } from '@/app/common/components/molecules/ActionBar';

const meta: Meta<typeof ActionBar> = {
  title: 'Molecules/ActionBar',
  component: ActionBar,
  args: {
    likeCount: 42,
    isBookmarked: false,
    onBookmark: fn(),
    onShare: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};

export const Bookmarked: Story = {
  args: { isBookmarked: true },
};

export const WithViewCount: Story = {
  args: { viewCount: 1280 },
};
