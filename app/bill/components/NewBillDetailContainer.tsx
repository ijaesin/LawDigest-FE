'use client';

import { useEffect, useRef, useCallback } from 'react';
import { DetailTemplate } from '@/app/common/components/templates';
import { BillDetailHero, ProgressSteps, VoteResultGrid, ProposerGrid } from '@/app/common/components/organisms';
import { useGetBillDetail, useMutateViewCount, useMutateBookmark } from '@/app/bill/hooks';
import { copyClipBoard } from '@/app/common/utils';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useAuthGuard } from '@/app/auth/hooks';
import AnotherBillList from './AnotherBillList';

export default function NewBillDetailContainer({ id }: { id: string }) {
  const { data } = useGetBillDetail(id);
  const { mutate: mutateViewCount } = useMutateViewCount(id);
  const mutateBookmark = useMutateBookmark(id);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();
  const hasMutated = useRef(false);

  useEffect(() => {
    if (!hasMutated.current) {
      hasMutated.current = true;
      mutateViewCount();
    }
  }, [mutateViewCount]);

  const handleBookmark = useCallback(() => {
    if (!requireLogin()) return;
    const next = !data.is_book_mark;
    setSnackbar({
      show: true,
      type: next ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: next ? '해당 법안을 스크랩했습니다.' : '해당 법안의 스크랩을 취소했습니다.',
      duration: 3000,
    });
    mutateBookmark.mutate(next);
  }, [data.is_book_mark, setSnackbar, mutateBookmark, requireLogin]);

  const handleShare = useCallback(() => {
    copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${id}`);
    setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
  }, [id, setSnackbar]);

  return (
    <DetailTemplate hero={<BillDetailHero bill={data} onBookmark={handleBookmark} onShare={handleShare} />}>
      <ProgressSteps currentStage={data.bill_info_dto.bill_stage} />
      <VoteResultGrid
        approvalCount={data.vote_result_response.approval_count}
        totalVoteCount={data.vote_result_response.total_vote_count}
        partyVoteList={data.vote_result_response.party_vote_list}
        billResult={data.bill_info_dto.bill_result}
      />
      <ProposerGrid
        representativeProposers={data.representative_proposer_dto_list}
        publicProposers={data.public_proposer_dto_list}
      />
      <AnotherBillList {...data} />
    </DetailTemplate>
  );
}
