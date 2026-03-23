import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/app/common/components/atoms/Logo';

describe('Logo', () => {
  it('renders images with alt text', () => {
    render(<Logo />);
    const images = screen.getAllByAltText('모두의입법');
    expect(images.length).toBe(2);
  });

  it('applies md size by default (width=140)', () => {
    render(<Logo />);
    const images = screen.getAllByAltText('모두의입법');
    expect(images[0]).toHaveAttribute('width', '140');
    expect(images[0]).toHaveAttribute('height', '28');
  });

  it('applies sm size (width=32)', () => {
    render(<Logo size="sm" />);
    const images = screen.getAllByAltText('모두의입법');
    expect(images[0]).toHaveAttribute('width', '32');
    expect(images[0]).toHaveAttribute('height', '32');
  });

  it('applies lg size (width=222)', () => {
    render(<Logo size="lg" />);
    const images = screen.getAllByAltText('모두의입법');
    expect(images[0]).toHaveAttribute('width', '222');
    expect(images[0]).toHaveAttribute('height', '37');
  });
});
