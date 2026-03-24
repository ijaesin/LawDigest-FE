import type { Meta, StoryObj } from '@storybook/react';
import { ProposerAvatar } from '@/app/common/components/molecules/ProposerAvatar';

const meta: Meta<typeof ProposerAvatar> = {
  title: 'Molecules/ProposerAvatar',
  component: ProposerAvatar,
};
export default meta;
type Story = StoryObj<typeof ProposerAvatar>;

export const Default: Story = {
  args: {
    name: '홍길동',
    imageUrl: '/placeholder-avatar.png',
    partyName: '더불어민주당',
  },
};

export const WithoutLabel: Story = {
  args: {
    name: '홍길동',
    imageUrl: '/placeholder-avatar.png',
    partyName: '더불어민주당',
    showLabel: false,
  },
};

export const WithLink: Story = {
  args: {
    name: '홍길동',
    imageUrl: '/placeholder-avatar.png',
    partyName: '더불어민주당',
    congressmanId: '12345',
  },
};
