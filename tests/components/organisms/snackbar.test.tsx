import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnackbarStore } from '@/app/common/store';
import { Snackbar } from '@/app/common/components/organisms/Snackbar';

describe('Snackbar', () => {
  beforeEach(() => {
    act(() => {
      useSnackbarStore.getState().resetSnackbar();
    });
  });

  it('renders message when show is true', () => {
    act(() => {
      useSnackbarStore.getState().setSnackbar({
        show: true,
        message: '테스트 메시지',
        type: 'success',
      });
    });

    render(<Snackbar />);
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('is hidden when show is false', () => {
    render(<Snackbar />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('auto-closes after duration', () => {
    vi.useFakeTimers();

    act(() => {
      useSnackbarStore.getState().setSnackbar({
        show: true,
        message: '자동 닫힘 테스트',
        duration: 1000,
      });
    });

    render(<Snackbar />);
    expect(screen.getByText('자동 닫힘 테스트')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('자동 닫힘 테스트')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
