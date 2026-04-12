'use client';

import { Snackbar, SearchModal } from '@/app/common/components/organisms';
import GoToTopButton from '@/app/common/components/Button/GoToTopButton';

export default function ClientOnlyWidgets() {
  return (
    <>
      <SearchModal />
      <Snackbar />
      <GoToTopButton />
    </>
  );
}
