import type { Meta, StoryObj } from '@storybook/react';
import { RightSidebar } from '@/app/common/components/organisms';

const meta: Meta<typeof RightSidebar> = {
  title: 'Organisms/RightSidebar',
  component: RightSidebar,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof RightSidebar>;

export const Default: Story = {
  args: {
    children: (
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">사이드바 위젯</h3>
        <p className="text-sm text-muted-foreground">사이드바에 표시될 내용입니다.</p>
      </div>
    ),
  },
};
