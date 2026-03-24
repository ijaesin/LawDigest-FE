import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '@/app/common/components/molecules/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  argTypes: {
    onSearch: { action: 'onSearch' },
  },
};
export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: { defaultValue: '교육기본법' },
};
