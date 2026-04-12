import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '@/app/common/components/molecules/StatCard';

describe('StatCard', () => {
  it('renders value', () => {
    render(<StatCard value={42} label="발의 법안" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<StatCard value={42} label="발의 법안" />);
    expect(screen.getByText('발의 법안')).toBeInTheDocument();
  });

  it('formats number with locale', () => {
    render(<StatCard value={1234567} label="총 조회수" />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });
});
