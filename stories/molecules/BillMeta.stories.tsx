import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BillMeta } from '@/app/common/components/molecules/BillMeta';

const meta: Meta<typeof BillMeta> = {
  title: 'Molecules/BillMeta',
  component: BillMeta,
};
export default meta;
type Story = StoryObj<typeof BillMeta>;

export const Reception: Story = {
  args: { stage: '접수', proposeDate: '2026-03-20T00:00:00' },
};

export const Committee: Story = {
  args: { stage: '위원회 심사', proposeDate: '2026-03-10T00:00:00' },
};

export const Passed: Story = {
  args: { stage: '가결', proposeDate: '2026-02-15T00:00:00' },
};

export const Rejected: Story = {
  args: { stage: '부결', proposeDate: '2026-01-01T00:00:00' },
};
