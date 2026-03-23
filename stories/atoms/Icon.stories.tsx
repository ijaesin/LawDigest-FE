import type { Meta, StoryObj } from '@storybook/react';
import { Heart, Search, Bell, Settings, User, Star } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms/Icon';

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = { args: { icon: Heart } };

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Heart} size="sm" />
      <Icon icon={Heart} size="md" />
      <Icon icon={Heart} size="lg" />
    </div>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Heart} />
      <Icon icon={Search} />
      <Icon icon={Bell} />
      <Icon icon={Settings} />
      <Icon icon={User} />
      <Icon icon={Star} />
    </div>
  ),
};
