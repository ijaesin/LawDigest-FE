'use client';

import BillDetail from './BillDetail';

export default function BillContainer({ id }: { id: string }) {
  return (
    <section className="flex flex-col md:mb-10">
      <BillDetail id={id} />
    </section>
  );
}
