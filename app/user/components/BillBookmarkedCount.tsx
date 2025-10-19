'use client';

import { useEffect, useState } from 'react';
import { useGetBillBookmarkedCount } from '@/app/user/hooks';

export default function BillBookmarkedCount() {
  const { data: billBookmarkedCount } = useGetBillBookmarkedCount();
  const [billCount, setBillCount] = useState(billBookmarkedCount ? billBookmarkedCount.count : 0);

  useEffect(() => {
    if (billBookmarkedCount) {
      setBillCount(billBookmarkedCount.count);
    }
  }, [billBookmarkedCount]);

  return <span className="text-[#555555] dark:text-gray-2">{billCount}</span>;
}
