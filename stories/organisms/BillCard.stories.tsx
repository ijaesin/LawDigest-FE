import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { BillCard } from '@/app/common/components/organisms';
import type { BillResponse } from '@/app/bill/validation/bill.schema';

const mockBill: BillResponse = {
  bill_info_dto: {
    bill_id: 'BILL001',
    bill_name: '국민건강보험법 일부개정법률안',
    propose_date: '2025-03-15',
    summary: '건강보험 보장성 강화',
    gpt_summary: 'AI 요약: 건강보험 보장성을 강화하는 개정안',
    view_count: 1247,
    bill_like_count: 128,
    bill_stage: '위원회 심사',
    brief_summary: '건강보험법 개정안',
    bill_link: '',
    bill_result: '',
  },
  representative_proposer_dto_list: [
    {
      representative_proposer_id: 'C001',
      representative_proposer_name: '김민수',
      represent_proposer_img_url: '/img/c001.jpg',
      party_id: 1,
      party_image_url: '/img/party1.png',
      party_name: '더불어민주당',
    },
  ],
  public_proposer_dto_list: [],
  is_book_mark: false,
  similar_bills: [],
  vote_result_response: { approval_count: 0, total_vote_count: 0, party_vote_list: [] },
};

const meta: Meta<typeof BillCard> = {
  title: 'Organisms/BillCard',
  component: BillCard,
  args: {
    bill: mockBill,
    onBookmark: fn(),
    onShare: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof BillCard>;

export const Default: Story = {};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const Bookmarked: Story = {
  args: {
    bill: { ...mockBill, is_book_mark: true },
  },
};

export const NoProposer: Story = {
  args: {
    bill: { ...mockBill, representative_proposer_dto_list: [] },
  },
};
