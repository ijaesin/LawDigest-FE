import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassCard> = {
  title: 'Atoms/GlassCard',
  component: GlassCard,
  argTypes: {
    level: { control: 'select', options: ['subtle', 'medium', 'heavy'] },
    hover: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof GlassCard>;

export const Subtle: Story = { args: { level: 'subtle', children: 'Subtle glass card content' } };
export const Medium: Story = { args: { level: 'medium', children: 'Medium glass card content' } };
export const Heavy: Story = { args: { level: 'heavy', children: 'Heavy glass card content' } };
export const Hoverable: Story = { args: { level: 'subtle', hover: true, children: 'Hover me' } };
export const DarkMode: Story = {
  args: { level: 'subtle', children: 'Dark mode glass card' },
  parameters: { backgrounds: { default: 'dark' } },
};
