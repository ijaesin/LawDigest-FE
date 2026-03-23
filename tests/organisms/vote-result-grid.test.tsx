import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VoteResultGrid } from '@/app/common/components/organisms';

const mockPartyVoteList = [
  { party_info: { party_id: 1, party_name: '더불어민주당', party_image_url: '/img/p1.png' }, party_approval_count: 80 },
  { party_info: { party_id: 2, party_name: '국민의힘', party_image_url: '/img/p2.png' }, party_approval_count: 50 },
];

describe('VoteResultGrid', () => {
  it('renders total vote bar', () => {
    render(<VoteResultGrid approvalCount={130} totalVoteCount={200} partyVoteList={mockPartyVoteList} />);
    expect(screen.getByText(/130\/200/)).toBeInTheDocument();
  });

  it('renders party names', () => {
    render(<VoteResultGrid approvalCount={130} totalVoteCount={200} partyVoteList={mockPartyVoteList} />);
    expect(screen.getByText('더불어민주당')).toBeInTheDocument();
    expect(screen.getByText('국민의힘')).toBeInTheDocument();
  });

  it('renders vote counts per party', () => {
    render(<VoteResultGrid approvalCount={130} totalVoteCount={200} partyVoteList={mockPartyVoteList} />);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
