import type { Meta, StoryObj } from '@storybook/react';
import { GlassSkeleton } from '@/app/common/components/GlassSkeleton/GlassSkeleton';

const meta: Meta<typeof GlassSkeleton> = {
  title: 'Components/GlassSkeleton',
  component: GlassSkeleton,
};
export default meta;

type Story = StoryObj<typeof GlassSkeleton>;

export const SingleLine: Story = { args: { lines: 1 } };
export const MultipleLines: Story = { args: { lines: 3 } };
export const CardVariant: Story = { args: { variant: 'card' } };
export const CardList: Story = {
  render: () => (
    <div className="space-y-4">
      <GlassSkeleton variant="card" />
      <GlassSkeleton variant="card" />
      <GlassSkeleton variant="card" />
    </div>
  ),
};
