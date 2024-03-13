import { Bill } from '@/components/Bill';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/app/getQueryClient';
import GPTSummary from '@/components/GPTSummary';
import { Button } from '@nextui-org/button';
import Link from 'next/link';
import { Divider } from '@nextui-org/react';
import Proposers from '@/components/Proposers';
import { useBillDetail } from './apis';
import Chart from './components/Chart';
import Stages from './components/Stages';
import Keywords from './components/Keywords';
import SectionContainer from './components/SectionContainer';

export default async function BillDetail({ params: { id } }: { params: { id: string } }) {
  const queryClient = getQueryClient();
  const { data: bill } = await useBillDetail({ id, queryClient });
  const {
    bill_info_dto: { bill_id, bill_name, propose_date, summary, gpt_summary },
    representative_proposer_dto: {
      representative_proposer_id,
      representative_proposer_name,
      represent_proposer_img_url,
      party_image_url,
      party_name,
    },
    public_proposer_dto_list,
  } = bill;

  const datas = public_proposer_dto_list.map(({ public_proposer_id }) => public_proposer_id);
  const partyNames = public_proposer_dto_list.map(({ public_party_name }) => public_party_name);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col">
        <Bill {...bill} detail>
          <div className="flex flex-col gap-[34px]">
            <Divider className="bg-gray-0.5" />

            <GPTSummary />

            <div className="flex flex-col items-center gap-3">
              <h5 className="text-xs font-semibold text-theme-alert">
                AI 기반의 요약은 내용이 불완전할 수 있습니다. 꼭 원문을 확인해주세요 !
              </h5>

              <Link href="https://law.nanet.go.kr/foreignlaw/newForeignLawissue/list.do?isMenu=Y">
                <Button size="lg" color="primary" radius="full" className="w-[242px] h-[56px] bg-primary-3">
                  원문 확인하기
                </Button>
              </Link>
            </div>

            <Divider className="bg-gray-0.5" />
          </div>

          <SectionContainer title="주요 키워드">키워드</SectionContainer>

          <SectionContainer title="발의자 명단">발의자 명단</SectionContainer>

          <SectionContainer title="심사 진행 단계">심사 진행 단계</SectionContainer>

          <SectionContainer title="다른 개정안 보기">다른 개정안 보기</SectionContainer>

          {/* <Chart datas={datas} partyNames={partyNames} /> */}
          {/* <Stages stage={stage} />
        <Proposers
          represent_proposer={represent_proposer}
          represent_proposer_id={represent_proposer_id}
          public_proposer_list={public_proposer_list}
          public_proposer_id_list={public_proposer_id_list}
        /> */}
          {/* <Keywords keywords={keywords} /> */}
          {/* <Similars similars={similars} /> */}
        </Bill>
      </section>
    </HydrationBoundary>
  );
}
