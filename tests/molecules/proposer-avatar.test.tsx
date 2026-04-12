import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProposerAvatar } from '@/app/common/components/molecules/ProposerAvatar';

describe('ProposerAvatar', () => {
  it('renders name', () => {
    render(<ProposerAvatar name="홍길동" imageUrl="/test.jpg" partyName="더불어민주당" />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('renders party name', () => {
    render(<ProposerAvatar name="홍길동" imageUrl="/test.jpg" partyName="더불어민주당" />);
    expect(screen.getByText('더불어민주당')).toBeInTheDocument();
  });

  it('renders avatar with fallback text', () => {
    render(<ProposerAvatar name="홍길동" imageUrl="/test.jpg" partyName="더불어민주당" />);
    expect(screen.getByText('홍')).toBeInTheDocument();
  });
});
