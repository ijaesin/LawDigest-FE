import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CongressmanCard } from '@/app/common/components/organisms/CongressmanCard';
import type { CongressmanDetail } from '@/app/congressman/validation';

const mockCongressman: CongressmanDetail = {
  congressman_id: 'C001',
  congressman_name: '김민수',
  party_id: 1,
  party_name: '더불어민주당',
  party_image_url: '',
  elect_sort: '지역구',
  district: '서울 강남구',
  commits: '',
  elected: '초선',
  homepage: '',
  represent_count: 15,
  public_count: 42,
  congressman_image_url: '/img/c001.jpg',
  like_checked: false,
  office: '',
  email: '',
  age: 55,
  gender: '남',
  follow_count: 128,
  brief_history: '',
  telephone: '',
};

describe('CongressmanCard', () => {
  const onFollow = vi.fn();

  it('renders congressman name', () => {
    render(<CongressmanCard congressman={mockCongressman} onFollow={onFollow} />);
    expect(screen.getByText('김민수')).toBeInTheDocument();
  });

  it('renders party name', () => {
    render(<CongressmanCard congressman={mockCongressman} onFollow={onFollow} />);
    expect(screen.getByText('더불어민주당')).toBeInTheDocument();
  });

  it('renders follow button in full variant', () => {
    render(<CongressmanCard congressman={mockCongressman} onFollow={onFollow} />);
    expect(screen.getByText('팔로우')).toBeInTheDocument();
  });
});
