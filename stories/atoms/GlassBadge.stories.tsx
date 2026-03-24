import type { Meta, StoryObj } from '@storybook/react';
import { GlassBadge } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassBadge> = {
  title: 'Atoms/GlassBadge',
  component: GlassBadge,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'warning', 'danger', 'glass', 'outline'] },
  },
};
export default meta;
type Story = StoryObj<typeof GlassBadge>;

export const Primary: Story = { args: { children: 'Primary' } };
export const Accent: Story = { args: { variant: 'accent', children: 'Accent' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Danger' } };
export const Glass: Story = { args: { variant: 'glass', children: 'Glass' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Outline' } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <GlassBadge variant="primary">Primary</GlassBadge>
      <GlassBadge variant="accent">Accent</GlassBadge>
      <GlassBadge variant="warning">Warning</GlassBadge>
      <GlassBadge variant="danger">Danger</GlassBadge>
      <GlassBadge variant="glass">Glass</GlassBadge>
      <GlassBadge variant="outline">Outline</GlassBadge>
    </div>
  ),
};
