'use client';

import { Suspense } from 'react';
import { Loading } from '@/app/common/components/Loading';
import { Feed } from '@/app/bill/components';
import { NotificationTopThree } from '@/app/notification/components';

export default function ClientHomeSection() {
  return (
    <section className="lg:w-[880px] mx-auto ">
      <Suspense fallback={<Loading />}>
        <NotificationTopThree />
        <Feed />
      </Suspense>
    </section>
  );
}
