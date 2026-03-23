import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { BillResponse } from '@/app/bill/validation/bill.schema';
import { BillCard } from '@/app/common/components/organisms';

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

describe('BillCard', () => {
  it('renders bill title', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('건강보험법 개정안')).toBeInTheDocument();
  });

  it('renders gpt summary', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText(/AI 요약/)).toBeInTheDocument();
  });

  it('renders proposer name', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('김민수')).toBeInTheDocument();
  });

  it('renders stage badge', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('위원회 심사')).toBeInTheDocument();
  });

  it('renders compact variant with truncated title', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} variant="compact" />);
    expect(screen.getByText('건강보험법 개정안')).toBeInTheDocument();
    // No summary in compact mode
    expect(screen.queryByText(/AI 요약/)).not.toBeInTheDocument();
  });

  it('calls onBookmark with billId', async () => {
    const onBookmark = vi.fn();
    render(<BillCard bill={mockBill} onBookmark={onBookmark} onShare={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /북마크/ }));
    expect(onBookmark).toHaveBeenCalledWith('BILL001');
  });

  it('calls onShare with billId', async () => {
    const onShare = vi.fn();
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={onShare} />);
    await userEvent.click(screen.getByRole('button', { name: /공유/ }));
    expect(onShare).toHaveBeenCalledWith('BILL001');
  });

  it('falls back to summary when gpt_summary is empty', () => {
    const billNoGpt: BillResponse = {
      ...mockBill,
      bill_info_dto: { ...mockBill.bill_info_dto, gpt_summary: '' },
    };
    render(<BillCard bill={billNoGpt} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('건강보험 보장성 강화')).toBeInTheDocument();
  });

  it('renders without proposer when list is empty', () => {
    const billNoProposer: BillResponse = {
      ...mockBill,
      representative_proposer_dto_list: [],
    };
    render(<BillCard bill={billNoProposer} onBookmark={vi.fn()} onShare={vi.fn()} />);
    expect(screen.getByText('건강보험법 개정안')).toBeInTheDocument();
    expect(screen.queryByText('김민수')).not.toBeInTheDocument();
  });

  it('links to bill detail page', () => {
    render(<BillCard bill={mockBill} onBookmark={vi.fn()} onShare={vi.fn()} />);
    const link = screen.getAllByRole('link').find((el) => el.getAttribute('href') === '/bill/BILL001');
    expect(link).toBeDefined();
  });
});
