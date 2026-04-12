import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartyCard } from '@/app/common/components/organisms/PartyCard';
import type { PartyDetail } from '@/app/party/validation';

const mockParty: PartyDetail = {
  party_id: 1,
  party_name: '더불어민주당',
  party_img_url: '/img/party1.png',
  total_congressman_count: 170,
  proportional_congressman_count: 30,
  district_congressman_count: 140,
  representative_bill_count: 500,
  public_bill_count: 1200,
  follow_count: 5000,
  website_url: 'https://theminjoo.kr',
  followed: false,
};

describe('PartyCard', () => {
  const onFollow = vi.fn();

  it('renders party name', () => {
    render(<PartyCard party={mockParty} onFollow={onFollow} />);
    expect(screen.getByText('더불어민주당')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(<PartyCard party={mockParty} onFollow={onFollow} />);
    expect(screen.getByText('소속 의원')).toBeInTheDocument();
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('renders follow button', () => {
    render(<PartyCard party={mockParty} onFollow={onFollow} />);
    expect(screen.getByText('팔로우')).toBeInTheDocument();
  });
});
