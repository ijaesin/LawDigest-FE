import type { Meta, StoryObj } from '@storybook/react';
import { RightSidebar } from '@/app/common/components/Layout/RightSidebar/RightSidebar';

const meta: Meta<typeof RightSidebar> = {
  title: 'Patterns/RightSidebar',
  component: RightSidebar,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof RightSidebar>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <div className="glass-subtle rounded-md p-4">검색바</div>
        <div className="glass-subtle rounded-md p-4">인기 법안</div>
        <div className="glass-subtle rounded-md p-4">트렌딩 키워드</div>
      </div>
    ),
  },
};
