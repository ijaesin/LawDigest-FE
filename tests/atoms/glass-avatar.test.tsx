import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassAvatar } from '@/app/common/components/atoms';

// Helper: getByText returns the AvatarFallback span; its parent is the Avatar root span
function getAvatarRoot(fallbackText: string): HTMLElement {
  const fallback = screen.getByText(fallbackText);
  return fallback.parentElement!;
}

describe('GlassAvatar', () => {
  it('renders fallback text', () => {
    render(<GlassAvatar fallback="AB" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('applies default md size (h-10 w-10)', () => {
    render(<GlassAvatar fallback="MD" />);
    const avatar = getAvatarRoot('MD');
    expect(avatar).toHaveClass('h-10', 'w-10');
  });

  it('applies sm size (h-7 w-7)', () => {
    render(<GlassAvatar size="sm" fallback="SM" />);
    const avatar = getAvatarRoot('SM');
    expect(avatar).toHaveClass('h-7', 'w-7');
  });

  it('applies lg size (h-14 w-14)', () => {
    render(<GlassAvatar size="lg" fallback="LG" />);
    const avatar = getAvatarRoot('LG');
    expect(avatar).toHaveClass('h-14', 'w-14');
  });

  it('applies xl size (h-20 w-20)', () => {
    render(<GlassAvatar size="xl" fallback="XL" />);
    const avatar = getAvatarRoot('XL');
    expect(avatar).toHaveClass('h-20', 'w-20');
  });

  it('applies party color border for 더불어민주당', () => {
    render(<GlassAvatar partyName="더불어민주당" fallback="민" />);
    const avatar = getAvatarRoot('민');
    expect(avatar).toHaveStyle({ borderColor: '#152484' });
  });

  it('does not apply border without partyName', () => {
    render(<GlassAvatar fallback="N" />);
    const avatar = getAvatarRoot('N');
    expect(avatar).not.toHaveStyle({ borderStyle: 'solid' });
  });
});
