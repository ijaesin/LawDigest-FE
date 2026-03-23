import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProposerGrid } from '@/app/common/components/organisms';

const mockRepresentativeProposers = [
  {
    representative_proposer_id: 'C001',
    representative_proposer_name: '김민수',
    represent_proposer_img_url: '/img/c001.jpg',
    party_id: 1,
    party_image_url: '/img/party1.png',
    party_name: '더불어민주당',
  },
  {
    representative_proposer_id: 'C002',
    representative_proposer_name: '이영희',
    represent_proposer_img_url: '/img/c002.jpg',
    party_id: 2,
    party_image_url: '/img/party2.png',
    party_name: '국민의힘',
  },
];

const mockPublicProposers = [
  {
    public_proposer_id: 'P001',
    public_proposer_name: '박철수',
    public_proposer_img_url: '/img/p001.jpg',
    public_proposer_party_id: 1,
    public_proposer_party_image_url: '/img/party1.png',
    public_proposer_party_name: '더불어민주당',
  },
  {
    public_proposer_id: 'P002',
    public_proposer_name: '최수진',
    public_proposer_img_url: '/img/p002.jpg',
    public_proposer_party_id: 2,
    public_proposer_party_image_url: '/img/party2.png',
    public_proposer_party_name: '국민의힘',
  },
  {
    public_proposer_id: 'P003',
    public_proposer_name: '정하나',
    public_proposer_img_url: '/img/p003.jpg',
    public_proposer_party_id: 1,
    public_proposer_party_image_url: '/img/party1.png',
    public_proposer_party_name: '더불어민주당',
  },
];

describe('ProposerGrid', () => {
  it('renders representative proposer names', () => {
    render(
      <ProposerGrid representativeProposers={mockRepresentativeProposers} publicProposers={mockPublicProposers} />,
    );
    expect(screen.getByText('김민수')).toBeInTheDocument();
    expect(screen.getByText('이영희')).toBeInTheDocument();
  });

  it('renders public proposer count', () => {
    render(
      <ProposerGrid representativeProposers={mockRepresentativeProposers} publicProposers={mockPublicProposers} />,
    );
    expect(screen.getByText(/공동발의자 3명/)).toBeInTheDocument();
  });

  it('renders avatars', () => {
    render(
      <ProposerGrid representativeProposers={mockRepresentativeProposers} publicProposers={mockPublicProposers} />,
    );
    // Avatar fallback initials for representative proposers
    expect(screen.getByText('김')).toBeInTheDocument();
    expect(screen.getByText('이')).toBeInTheDocument();
  });
});
