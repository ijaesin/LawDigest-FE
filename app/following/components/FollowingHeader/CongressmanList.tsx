import { FollowingCongressmanResponse } from '@/types';
import CongressmanItem from './CongressmanItem';

export default function CongressmanList({ congressmanList }: { congressmanList: FollowingCongressmanResponse }) {
  return (
    <ul className="flex w-full gap-3 mx-auto lg:flex-wrap">
      {congressmanList.map((congressman) => (
        <CongressmanItem {...congressman} key={congressman.congressman_id} />
      ))}
    </ul>
  );
}