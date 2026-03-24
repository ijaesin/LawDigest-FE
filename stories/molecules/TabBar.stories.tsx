import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TabBar } from '@/app/common/components/molecules/TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Molecules/TabBar',
  component: TabBar,
  argTypes: {
    variant: { control: 'select', options: ['pill', 'underline'] },
  },
};
export default meta;
type Story = StoryObj<typeof TabBar>;

const twoTabs = [
  { label: 'All', value: 'all' },
  { label: 'Popular', value: 'popular' },
];

const threeTabs = [
  { label: 'Latest', value: 'latest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Following', value: 'following' },
];

export const Pill: Story = {
  args: { tabs: twoTabs, activeValue: 'all', variant: 'pill' },
};

export const Underline: Story = {
  args: { tabs: twoTabs, activeValue: 'popular', variant: 'underline' },
};

export const ThreeTabs: Story = {
  render: () => {
    const [active, setActive] = useState('latest');
    return <TabBar tabs={threeTabs} activeValue={active} onChange={setActive} variant="pill" />;
  },
};
