import type { Meta, StoryObj } from '@storybook/react';
import { GlassButton } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassButton> = {
  title: 'Atoms/GlassButton',
  component: GlassButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'glass', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof GlassButton>;

export const Primary: Story = { args: { children: 'Primary Button' } };
export const Glass: Story = { args: { variant: 'glass', children: 'Glass Button' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Outline Button' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost Button' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Danger Button' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Large' } };
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <GlassButton variant="primary">Primary</GlassButton>
      <GlassButton variant="glass">Glass</GlassButton>
      <GlassButton variant="outline">Outline</GlassButton>
      <GlassButton variant="ghost">Ghost</GlassButton>
      <GlassButton variant="danger">Danger</GlassButton>
    </div>
  ),
};
