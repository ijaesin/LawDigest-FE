import { FollowingParty } from '@/app/user/validation';
import { useGetFollowingParty } from '@/app/user/hooks';
import PartyItem from './PartyItem';

export default function PartyList() {
  const { data: partyList } = useGetFollowingParty();
  const partyLength = partyList.length;

  return (
    <section className="px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold">
        팔로우한 정당 &middot;<span className="text-[#555555] dark:text-gray-2"> {partyLength}</span>
      </p>

      <div className="grid grid-cols-2 gap-y-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:w-[750px] xl:w-[900px]">
        {partyList.map((party: FollowingParty) => (
          <PartyItem key={party.party_name} {...party} />
        ))}
      </div>
    </section>
  );
}
