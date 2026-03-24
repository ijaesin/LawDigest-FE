import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { FeedList } from '@/app/common/components/organisms';
import { GlassCard } from '@/app/common/components/atoms';

const meta: Meta<typeof FeedList> = {
  title: 'Organisms/FeedList',
  component: FeedList,
  args: {
    onLoadMore: fn(),
    hasMore: true,
    isLoading: false,
  },
};
export default meta;
type Story = StoryObj<typeof FeedList>;

function SampleItems() {
  return (
    <>
      <GlassCard>Feed item 1</GlassCard>
      <GlassCard>Feed item 2</GlassCard>
      <GlassCard>Feed item 3</GlassCard>
    </>
  );
}

export const Default: Story = {
  args: {
    children: <SampleItems />,
  },
};

export const Loading: Story = {
  args: {
    children: <SampleItems />,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    children: null,
    hasMore: false,
  },
};

export const Error: Story = {
  args: {
    children: null,
    isError: true,
    onRetry: fn(),
  },
};
