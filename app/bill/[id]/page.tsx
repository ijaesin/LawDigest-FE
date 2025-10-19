import { Metadata } from 'next';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata } from '@/app/common/utils';
import { getBillDetail } from '@/app/bill/services/apis';
import { BillContainer } from '@/app/bill/components';

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
    <section className="flex flex-col">
      <SubHeader title="의안 자세히 보기" />
      <BillContainer id={id} />
    </section>
  );
}
