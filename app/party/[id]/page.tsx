import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { notFound } from 'next/navigation';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata, getPartyConstant } from '@/app/common/utils';
import { Metadata } from 'next';
import { PARTY_POSITION } from '@/app/party/constants';
import { getPartyDetail } from '@/app/party/services/apis';
import { partyKeys } from '@/app/party/services/query-keys';
import { PartyContainer, PartyErrorFallback, PartySkeleton } from '@/app/party/components';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const partyId = Number(id);
  if (Number.isNaN(partyId)) notFound();

  const queryClient = new QueryClient();
  const detail = await queryClient.fetchQuery({
    queryKey: partyKeys.detail(partyId),
    queryFn: () => getPartyDetail(partyId),
  });

  return getMetadata({
    title: `${detail.party_name}`,
    description: `${detail.party_name} 상세 페이지, ${getPartyConstant(PARTY_POSITION, detail.party_name)}, 지역구 ${detail.district_congressman_count} 석, 비례대표 ${detail.proportional_congressman_count} 석`,
    asPath: `/party/${id}`,
  });
};

export default async function Party({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partyId = Number(id);
  if (Number.isNaN(partyId)) notFound();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: partyKeys.detail(partyId),
    queryFn: () => getPartyDetail(partyId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="정당 프로필" />
        <ErrorBoundary FallbackComponent={PartyErrorFallback}>
          <Suspense fallback={<PartySkeleton />}>
            <PartyContainer partyId={partyId} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrationBoundary>
  );
}
