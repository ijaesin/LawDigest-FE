import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Search } from 'lucide-react';
import { GlassInput } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassInput> = {
  title: 'Atoms/GlassInput',
  component: GlassInput,
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof GlassInput>;

export const Default: Story = { args: { placeholder: 'Enter text...' } };

export const WithIcon: Story = {
  args: {
    placeholder: 'Search...',
    icon: <Search className="size-4 text-muted-foreground" />,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};
