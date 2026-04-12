'use client';

import { SearchBarButton } from '@/app/search/components';
import FollowingNav from './FollowingNav';
import BillContainer from './BillContainer';

export default function FollowingContent() {
  return (
    <section className="flex flex-col mx-auto lg:flex-row lg:justify-center">
      <FollowingNav />
      <div className="mt-4 md:mt-0 lg:border-l-1 lg:dark:border-dark-l">
        <div className="hidden mt-11 lg:block">
          <SearchBarButton />
        </div>
        <BillContainer />
      </div>
    </section>
  );
}
