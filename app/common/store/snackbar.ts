'use client';

import { create } from 'zustand';
import type { SnackbarType } from '@/app/common/types/snackbar';
import { SNACKBAR_TYPE } from '@/app/common/constants/snackbar';

export interface SnackbarState {
  show: boolean;
  type: SnackbarType;
  message: string;
  duration?: number | null;
  action?: { label: string; href: string } | null;
}

interface SnackbarStore extends SnackbarState {
  setSnackbar: (next: Partial<SnackbarState> & Pick<SnackbarState, 'message'>) => void;
  resetSnackbar: () => void;
}

const initialState: SnackbarState = {
  show: false,
  type: SNACKBAR_TYPE.DEFAULT,
  message: '',
  duration: 3000,
  action: null,
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
  ...initialState,
  setSnackbar: (next) =>
    set((state) => ({
      ...state,
      show: next.show ?? true,
      type: next.type ?? state.type,
      message: next.message,
      duration: next.duration ?? state.duration,
      action: next.action ?? null,
    })),
  resetSnackbar: () => set(() => ({ ...initialState })),
}));
