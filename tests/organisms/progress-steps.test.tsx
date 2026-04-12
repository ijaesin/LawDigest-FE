import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressSteps } from '@/app/common/components/organisms';

const STAGES = ['접수', '위원회 심사', '체계지구 심사', '본회의 심의', '정부 이송', '공포'];

describe('ProgressSteps', () => {
  it('renders all stages', () => {
    render(<ProgressSteps currentStage="접수" />);
    STAGES.forEach((stage) => {
      expect(screen.getByText(stage)).toBeInTheDocument();
    });
  });

  it('highlights the current stage', () => {
    render(<ProgressSteps currentStage="본회의 심의" />);
    const current = screen.getByText('본회의 심의');
    expect(current).toHaveClass('font-bold');
  });

  it('shows completed stages before current', () => {
    render(<ProgressSteps currentStage="본회의 심의" />);
    // Completed stages should have text-primary class
    const completed = screen.getByText('접수');
    expect(completed).toHaveClass('text-primary');
  });
});
