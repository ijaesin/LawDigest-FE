'use client';

import { Suspense } from 'react';
import Snackbar from '@/app/common/components/Snackbar/Snackbar';
import { SearchModal } from '@/app/search/components';
import { GoToTopButton } from '@/app/common/components';
import { Loading } from '@/app/common/components/Loading';

export default function ClientOnlyWidgets() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchModal />
      <Snackbar />
      <GoToTopButton />
    </Suspense>
  );
}
