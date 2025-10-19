import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata } from '@/app/common/utils';
import { Metadata } from 'next';
import { PARTY_POSITION, PARTY_NAME_KO } from '@/app/party/constants';
import { getPartyDetail } from '@/app/party/services';
import { partyKeys } from '@/app/party/hooks';
import { PartyContainer } from '@/app/party/components';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const queryClient = new QueryClient();
  const detail = await queryClient.fetchQuery({
    queryKey: partyKeys.detail(Number(id)),
    queryFn: () => getPartyDetail(Number(id)),
  });

  return getMetadata({
    title: `${detail.party_name}`,
    description: `${detail.party_name} 상세 페이지, ${PARTY_POSITION[detail.party_name as keyof typeof PARTY_NAME_KO]}, 지역구 ${detail.district_congressman_count} 석, 비례대표 ${detail.proportional_congressman_count} 석`,
    asPath: `/party/${id}`,
  });
};

export default async function Party({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: partyKeys.detail(Number(id)),
    queryFn: () => getPartyDetail(Number(id)),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="정당 프로필" />
        <PartyContainer id={id} />
      </section>
    </HydrationBoundary>
  );
}
