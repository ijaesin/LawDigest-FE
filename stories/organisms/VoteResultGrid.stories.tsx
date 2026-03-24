import type { Meta, StoryObj } from '@storybook/react';
import { VoteResultGrid } from '@/app/common/components/organisms';

const mockPartyVoteList = [
  { party_info: { party_id: 1, party_name: '더불어민주당', party_image_url: '' }, party_approval_count: 80 },
  { party_info: { party_id: 2, party_name: '국민의힘', party_image_url: '' }, party_approval_count: 50 },
  { party_info: { party_id: 3, party_name: '정의당', party_image_url: '' }, party_approval_count: 6 },
];

const meta: Meta<typeof VoteResultGrid> = {
  title: 'Organisms/VoteResultGrid',
  component: VoteResultGrid,
  args: {
    approvalCount: 136,
    totalVoteCount: 200,
    partyVoteList: mockPartyVoteList,
  },
};
export default meta;
type Story = StoryObj<typeof VoteResultGrid>;

export const Default: Story = {};

export const WithResult: Story = {
  args: {
    billResult: '원안가결',
  },
};

export const NoVotes: Story = {
  args: {
    approvalCount: 0,
    totalVoteCount: 0,
    partyVoteList: [],
  },
};
