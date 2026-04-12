import type { Meta, StoryObj } from '@storybook/react';
import { DetailTemplate } from '@/app/common/components/templates';
import { GlassCard } from '@/app/common/components/atoms';

const meta: Meta<typeof DetailTemplate> = {
  title: 'Templates/DetailTemplate',
  component: DetailTemplate,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof DetailTemplate>;

export const Default: Story = {
  args: {
    hero: (
      <GlassCard>
        <h1 className="text-xl font-bold">Bill Title</h1>
        <p className="text-muted-foreground">Summary of the bill goes here.</p>
      </GlassCard>
    ),
    children: (
      <div className="flex flex-col gap-4">
        <GlassCard>Section 1</GlassCard>
        <GlassCard>Section 2</GlassCard>
      </div>
    ),
  },
};
