import { Metadata } from 'next';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getMetadata } from '@/app/common/utils';
import { getBillDetail } from '@/app/bill/services/apis';
import { Loading } from '@/app/common/components/Loading';
import NewBillDetailContainer from '@/app/bill/components/NewBillDetailContainer';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  try {
    const data = await getBillDetail(id);
    return getMetadata({
      title: data.bill_info_dto.brief_summary,
      description: `${data.bill_info_dto.propose_date} 발의, 현재 ${data.bill_info_dto.bill_stage} 단계, '${data.bill_info_dto.bill_name}' 관련 발의안`,
      asPath: `/bill/${id}`,
    });
  } catch (error) {
    return getMetadata({
      title: '법안 상세',
      description: '법안 상세 정보를 불러오는 중입니다.',
      asPath: `/bill/${id}`,
    });
  }
};

export default async function BillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ErrorBoundary
      fallback={<p className="text-center py-10 text-muted-foreground">법안 정보를 불러올 수 없습니다.</p>}>
      <Suspense fallback={<Loading />}>
        <NewBillDetailContainer id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
