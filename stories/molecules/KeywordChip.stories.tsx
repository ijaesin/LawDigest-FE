import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { KeywordChip } from '@/app/common/components/molecules/KeywordChip';

const meta: Meta<typeof KeywordChip> = {
  title: 'Molecules/KeywordChip',
  component: KeywordChip,
  args: {
    onClick: fn(),
    onRemove: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof KeywordChip>;

export const Default: Story = {
  args: { keyword: '국민연금' },
};

export const LongKeyword: Story = {
  args: { keyword: '국민건강보험법 일부개정법률안에 대한 수정안' },
};

export const Multiple: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <KeywordChip {...args} keyword="국민연금" />
      <KeywordChip {...args} keyword="교육" />
      <KeywordChip {...args} keyword="부동산" />
    </div>
  ),
};
