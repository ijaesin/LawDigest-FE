import type { Meta, StoryObj } from '@storybook/react';
import { ProgressSteps } from '@/app/common/components/organisms';

const meta: Meta<typeof ProgressSteps> = {
  title: 'Organisms/ProgressSteps',
  component: ProgressSteps,
  args: {
    currentStage: '위원회 심사',
  },
};
export default meta;
type Story = StoryObj<typeof ProgressSteps>;

export const Default: Story = {};

export const FirstStage: Story = {
  args: { currentStage: '접수' },
};

export const MiddleStage: Story = {
  args: { currentStage: '본회의 심의' },
};

export const LastStage: Story = {
  args: { currentStage: '공포' },
};
