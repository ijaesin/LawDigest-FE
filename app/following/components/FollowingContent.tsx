'use client';

import FollowingNav from './FollowingNav';
import BillContainer from './BillContainer';

export default function FollowingContent() {
  return (
    <section className="flex flex-col gap-4">
      <FollowingNav />
      <BillContainer />
    </section>
  );
}
