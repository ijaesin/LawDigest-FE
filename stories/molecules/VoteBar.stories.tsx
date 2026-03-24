import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { VoteBar } from '@/app/common/components/molecules/VoteBar';

const meta: Meta<typeof VoteBar> = {
  title: 'Molecules/VoteBar',
  component: VoteBar,
};
export default meta;
type Story = StoryObj<typeof VoteBar>;

export const Default: Story = {
  args: { approvalCount: 70, totalCount: 100 },
};

export const WithLabel: Story = {
  args: { approvalCount: 70, totalCount: 100, showLabel: true },
};

export const FullApproval: Story = {
  args: { approvalCount: 100, totalCount: 100, showLabel: true },
};

export const NoVotes: Story = {
  args: { approvalCount: 0, totalCount: 0, showLabel: true },
};
