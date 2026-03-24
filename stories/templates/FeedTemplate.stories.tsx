import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { FeedTemplate } from '@/app/common/components/templates';
import { GlassCard } from '@/app/common/components/atoms';

const meta: Meta<typeof FeedTemplate> = {
  title: 'Templates/FeedTemplate',
  component: FeedTemplate,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof FeedTemplate>;

const sampleTabs = [
  { label: '전체', value: 'all' },
  { label: '팔로잉', value: 'following' },
  { label: '인기', value: 'popular' },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'all',
    onTabChange: fn(),
    children: (
      <>
        <GlassCard>Feed item 1</GlassCard>
        <GlassCard>Feed item 2</GlassCard>
        <GlassCard>Feed item 3</GlassCard>
      </>
    ),
  },
};

export const WithoutTabs: Story = {
  args: {
    children: (
      <>
        <GlassCard>Feed item 1</GlassCard>
        <GlassCard>Feed item 2</GlassCard>
      </>
    ),
  },
};
