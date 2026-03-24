import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';

const meta: Meta<typeof AppLayout> = {
  title: 'Patterns/AppLayout',
  component: AppLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AppLayout>;

export const WithRightSidebar: Story = {
  args: {
    children: (
      <div className="space-y-4 p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`card-${i}`} className="glass-subtle rounded-md p-6">
            Card {i + 1}
          </div>
        ))}
      </div>
    ),
    rightSidebar: (
      <div className="space-y-4">
        <div className="glass-subtle rounded-md p-4">검색바</div>
        <div className="glass-subtle rounded-md p-4">인기 법안</div>
      </div>
    ),
  },
};

export const WithoutRightSidebar: Story = {
  args: {
    children: <div className="p-4">콘텐츠만 표시</div>,
  },
};
