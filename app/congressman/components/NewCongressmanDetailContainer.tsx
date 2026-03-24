'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTabType } from '@/app/common/hooks';
import { useAuthGuard } from '@/app/auth/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { copyClipBoard } from '@/app/common/utils';
import { DetailTemplate } from '@/app/common/components/templates';
import { TabBar } from '@/app/common/components/molecules';
import { FeedList, BillCard, CongressmanCard } from '@/app/common/components/organisms';
import { BILL_TAB, BILL_TAB_KO } from '@/app/bill/constants';
import { patchBookmark } from '@/app/bill/services/apis';
import { billKeys } from '@/app/bill/hooks';
import {
  useGetCongressmanDetail,
  useInfiniteCongressmanBills,
  useMutateCongressmanFollow,
} from '@/app/congressman/hooks';
import type { ValueOf } from '@/app/common/types';
import type { BillResponse } from '@/app/bill/validation';

const EMPTY_BILLS: BillResponse[] = [];

const BILL_TABS = [
  { label: BILL_TAB_KO.representProposer, value: BILL_TAB.representProposer },
  { label: BILL_TAB_KO.publicProposer, value: BILL_TAB.publicProposer },
];

export default function NewCongressmanDetailContainer({ id }: { id: string }) {
  const { requireLogin } = useAuthGuard();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const queryClient = useQueryClient();

  const [billType, setBillType] = useTabType<typeof BILL_TAB>(BILL_TAB.representProposer);
  const { data: congressman } = useGetCongressmanDetail(id);
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteCongressmanBills(
    id,
    billType as ValueOf<typeof BILL_TAB>,
  );
  const mutationFollow = useMutateCongressmanFollow(id);

  const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? EMPTY_BILLS, [data]);

  const handleFollow = useCallback(() => {
    if (!requireLogin()) return;

    const nextChecked = !congressman.like_checked;
    setSnackbar({
      show: true,
      type: nextChecked ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextChecked ? '해당 의원을 팔로우했습니다.' : '해당 의원의 팔로우를 취소했습니다.',
      duration: 3000,
    });
    mutationFollow.mutate(nextChecked);
  }, [congressman.like_checked, requireLogin, setSnackbar, mutationFollow]);

  const handleBookmark = useCallback(
    (billId: string) => {
      if (!requireLogin()) return;

      const bill = bills.find((b) => b.bill_info_dto.bill_id === billId);
      if (!bill) return;

      const nextChecked = !bill.is_book_mark;
      setSnackbar({
        show: true,
        type: nextChecked ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
        message: nextChecked ? '해당 법안을 스크랩했습니다.' : '해당 법안의 스크랩을 취소했습니다.',
        duration: 3000,
      });

      patchBookmark({ billId, likeChecked: nextChecked }).then(() => {
        queryClient.invalidateQueries({ queryKey: billKeys.mainfeed() });
      });
    },
    [requireLogin, bills, setSnackbar, queryClient],
  );

  const handleShare = useCallback(
    (billId: string) => {
      copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${billId}`);
      setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
    },
    [setSnackbar],
  );

  return (
    <DetailTemplate hero={<CongressmanCard congressman={congressman} onFollow={handleFollow} variant="full" />}>
      <section className="px-5">
        <TabBar
          tabs={BILL_TABS}
          activeValue={billType}
          onChange={(v) => setBillType(v as ValueOf<typeof BILL_TAB>)}
          variant="pill"
        />

        <div className="mt-4">
          <FeedList
            onLoadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isLoading={isFetching}
            emptyMessage="발의한 법안이 존재하지 않습니다">
            {bills.map((bill) => (
              <BillCard
                key={bill.bill_info_dto.bill_id}
                bill={bill}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            ))}
          </FeedList>
        </div>
      </section>
    </DetailTemplate>
  );
}
