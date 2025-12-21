'use client';

import { create } from 'zustand';

interface SearchModalState {
  show: boolean;
}

interface SearchModalStore extends SearchModalState {
  open: () => void;
  close: () => void;
}

export const useSearchModalStore = create<SearchModalStore>((set) => ({
  show: false,
  open: () => set({ show: true }),
  close: () => set({ show: false }),
}));
