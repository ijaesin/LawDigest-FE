'use client';

import { useEffect, useRef } from 'react';
import { Separator } from '@/app/common/components/ui/separator';
import { useGetBillDetail, useMutateViewCount } from '@/app/bill/hooks';
import Bill from './Bill';
import SectionContainer from './SectionContainer';
import ProposerList from './ProposerList';
import ProgressStage from './ProgressStage';
import AnotherBillList from './AnotherBillList';
import ProcessResult from './ProcessResult';

export default function BillDetail({ id }: { id: string }) {
  const { data } = useGetBillDetail(id);
  const { mutate } = useMutateViewCount(id);
  const hasMutated = useRef(false);

  useEffect(() => {
    if (!hasMutated.current) {
      hasMutated.current = true;
      mutate();
    }
  }, [mutate]);

  return (
    <section>
      <Bill {...data} detail viewCount={data.bill_info_dto.view_count}>
        <section className="md:w-[300px] lg:w-[490px] md:float-right flex flex-col gap-[34px] mt-[34px]">
          <SectionContainer title="발의자 명단">
            <ProposerList
              representativeProposerList={data.representative_proposer_dto_list}
              publicProposerList={data.public_proposer_dto_list}
            />
          </SectionContainer>

          <Separator className="hidden md:block h-[1px] w-full border-border" />

          <SectionContainer title="심사 진행 단계">
            <ProgressStage billStage={data.bill_info_dto.bill_stage} />
          </SectionContainer>

          <Separator className="hidden md:block h-[1px] w-full border-border" />

          <SectionContainer title="법안 처리 결과">
            <ProcessResult
              approval_count={data.vote_result_response.approval_count}
              total_vote_count={data.vote_result_response.total_vote_count}
              party_vote_list={data.vote_result_response.party_vote_list}
              bill_result={data.bill_info_dto.bill_result}
            />
          </SectionContainer>
        </section>
      </Bill>

      <div className="md:w-[calc(100%-340px)] lg:w-[calc(100%-530px)] border-r-[1px] md:dark:border-border px-4 pt-[34px]">
        <SectionContainer>
          <AnotherBillList {...data} />
        </SectionContainer>
      </div>
    </section>
  );
}
