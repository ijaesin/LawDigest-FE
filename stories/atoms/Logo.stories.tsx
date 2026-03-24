import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Logo } from '@/app/common/components/atoms/Logo';

const meta: Meta<typeof Logo> = {
  title: 'Atoms/Logo',
  component: Logo,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = { args: {} };

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
    </div>
  ),
};
