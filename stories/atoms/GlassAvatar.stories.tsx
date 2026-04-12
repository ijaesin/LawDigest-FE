import type { Meta, StoryObj } from '@storybook/react';
import { GlassAvatar } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassAvatar> = {
  title: 'Atoms/GlassAvatar',
  component: GlassAvatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<typeof GlassAvatar>;

export const Default: Story = { args: { fallback: 'AB' } };

export const WithParty: Story = {
  args: { fallback: '민', partyName: '더불어민주당' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <GlassAvatar size="sm" fallback="SM" partyName="더불어민주당" />
      <GlassAvatar size="md" fallback="MD" partyName="국민의힘" />
      <GlassAvatar size="lg" fallback="LG" partyName="조국혁신당" />
      <GlassAvatar size="xl" fallback="XL" partyName="개혁신당" />
    </div>
  ),
};
