import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { BillResponse } from '@/app/bill/validation/bill.schema';
import { BillDetailHero } from '@/app/common/components/organisms';

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

describe('BillDetailHero', () => {
  it('renders bill title', () => {
    render(<BillDetailHero bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('건강보험법 개정안')).toBeInTheDocument();
  });

  it('renders stage badge', () => {
    render(<BillDetailHero bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('위원회 심사')).toBeInTheDocument();
  });

  it('renders ActionBar', () => {
    render(<BillDetailHero bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByRole('button', { name: /북마크/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /공유/ })).toBeInTheDocument();
  });

  it('renders meta info', () => {
    render(<BillDetailHero bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText(/발의일 2025-03-15/)).toBeInTheDocument();
    expect(screen.getByText(/조회 1247/)).toBeInTheDocument();
    expect(screen.getByText(/좋아요 128/)).toBeInTheDocument();
  });
});
