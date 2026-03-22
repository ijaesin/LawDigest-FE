import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata } from '@/app/common/utils';
import { Metadata } from 'next';
import { getCongressmanDetail } from '@/app/congressman/services/apis';
import { congressmanKeys } from '@/app/congressman/services/query-keys';
import { CongressmanContainer } from '@/app/congressman/components';
import CongressmanDetailSkeleton from '@/app/congressman/components/CongressmanDetailSkeleton';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const queryClient = new QueryClient();
  const detail = await queryClient.fetchQuery({
    queryKey: congressmanKeys.detail(id),
    queryFn: () => getCongressmanDetail(id),
  });

  return getMetadata({
    title: `${detail.congressman_name} 의원`,
    description: `${detail.party_name} ${detail.congressman_name} 의원의 상세 프로필 페이지, ${detail.district} ${detail.elected}, ${detail.commits}`,
    asPath: `/congressman/${id}`,
  });
};

export default async function Congressman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  // SSR prefetch congressman detail for hydration
  await queryClient.prefetchQuery({
    queryKey: congressmanKeys.detail(id),
    queryFn: () => getCongressmanDetail(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="의원 프로필" />
        <ErrorBoundary fallback={<p className="text-center py-10 text-gray-2">의원 정보를 불러올 수 없습니다.</p>}>
          <Suspense fallback={<CongressmanDetailSkeleton />}>
            <CongressmanContainer id={id} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrationBoundary>
  );
}
