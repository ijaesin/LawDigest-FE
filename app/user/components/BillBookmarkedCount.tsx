'use client';

import { useGetBillBookmarkedCount } from '@/app/user/hooks';

export default function BillBookmarkedCount() {
  const { data } = useGetBillBookmarkedCount();
  return <span className="text-muted-foreground">{data.count}</span>;
}
