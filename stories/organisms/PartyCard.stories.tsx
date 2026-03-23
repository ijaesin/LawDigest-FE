import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PartyCard } from '@/app/common/components/organisms';

const mockParty = {
  party_id: 1,
  party_name: '더불어민주당',
  party_img_url: '',
  total_congressman_count: 170,
  proportional_congressman_count: 30,
  district_congressman_count: 140,
  representative_bill_count: 500,
  public_bill_count: 1200,
  follow_count: 5000,
  website_url: 'https://theminjoo.kr',
  followed: false,
};

const meta: Meta<typeof PartyCard> = {
  title: 'Organisms/PartyCard',
  component: PartyCard,
  args: {
    onFollow: fn(),
    party: mockParty,
  },
};
export default meta;
type Story = StoryObj<typeof PartyCard>;

export const Full: Story = {};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const Following: Story = {
  args: {
    party: { ...mockParty, followed: true },
  },
};
