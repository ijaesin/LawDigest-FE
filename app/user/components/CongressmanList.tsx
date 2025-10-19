'use client';

import { useEffect, useState } from 'react';
import { useGetFollowingCongressman } from '@/app/user/hooks';
import { FollowingCongressman } from '@/app/user/validation';
import { ExpandableList } from '@/app/common/components';
import CongressmanItem from './CongressmanItem';

export default function CongressmanList() {
  const { data: congressmanList } = useGetFollowingCongressman();
  const [list, setList] = useState<FollowingCongressman[]>();

  useEffect(() => {
    if (congressmanList) {
      setList(congressmanList);
    }
  }, [congressmanList]);

  return (
    <section className="px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold">
        팔로우한 의원 &middot;<span className="text-[#555555] dark:text-gray-2"> {list?.length}</span>
      </p>

      {list && (
        <ExpandableList
          items={list.map((congressman: FollowingCongressman) => (
            <CongressmanItem key={congressman.congressman_id} {...congressman} />
          ))}
          initialCount={8}
        />
      )}
    </section>
  );
}
