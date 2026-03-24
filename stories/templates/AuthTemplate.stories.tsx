import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthTemplate } from '@/app/common/components/templates';
import { GlassCard } from '@/app/common/components/atoms';

const meta: Meta<typeof AuthTemplate> = {
  title: 'Templates/AuthTemplate',
  component: AuthTemplate,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof AuthTemplate>;

export const Default: Story = {
  args: {
    children: (
      <GlassCard className="w-full max-w-sm p-6">
        <h1 className="mb-4 text-xl font-bold">로그인</h1>
        <p className="text-muted-foreground">Login form placeholder</p>
      </GlassCard>
    ),
  },
};
