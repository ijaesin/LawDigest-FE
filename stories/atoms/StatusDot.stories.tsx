import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from '@/app/common/components/atoms/StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Atoms/StatusDot',
  component: StatusDot,
  argTypes: {
    active: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot active size="sm" />
      <StatusDot active size="md" />
    </div>
  ),
};
