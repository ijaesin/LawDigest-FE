'use client';

import { useGetFollowingCongressman } from '@/app/user/hooks';
import { FollowingCongressman } from '@/app/user/validation';
import { ExpandableList } from '@/app/common/components';
import CongressmanItem from './CongressmanItem';

export default function CongressmanList() {
  const { data: congressmanList } = useGetFollowingCongressman();

  return (
    <section className="px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold">
        팔로우한 의원 &middot;<span className="text-[#555555] dark:text-gray-2"> {congressmanList.length}</span>
      </p>

      <ExpandableList
        items={congressmanList.map((congressman: FollowingCongressman) => (
          <CongressmanItem key={congressman.congressman_id} {...congressman} />
        ))}
        initialCount={8}
      />
    </section>
  );
}
