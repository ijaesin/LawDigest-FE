import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '@/app/common/components/molecules/StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Molecules/StatCard',
  component: StatCard,
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { value: 1234, label: '발의 법안' },
};

export const Small: Story = {
  args: { value: 42, label: '발의 법안', size: 'sm' },
};

export const Large: Story = {
  args: { value: 1234567, label: '총 조회수', size: 'lg' },
};

export const GridOfThree: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <StatCard value={156} label="발의 법안" />
      <StatCard value={42} label="가결 법안" />
      <StatCard value="87%" label="출석률" />
    </div>
  ),
};
