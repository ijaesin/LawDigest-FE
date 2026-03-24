import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GlassSeparator } from '@/app/common/components/atoms/Separator';

const meta: Meta<typeof GlassSeparator> = {
  title: 'Atoms/Separator',
  component: GlassSeparator,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj<typeof GlassSeparator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Above</p>
      <GlassSeparator className="my-2" />
      <p className="text-sm">Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-2">
      <span className="text-sm">Left</span>
      <GlassSeparator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};
