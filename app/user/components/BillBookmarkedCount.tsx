'use client';

import { useGetBillBookmarkedCount } from '@/app/user/hooks';

export default function BillBookmarkedCount() {
  const { data } = useGetBillBookmarkedCount();
  return <span className="text-[#555555] dark:text-gray-2">{data.count}</span>;
}
