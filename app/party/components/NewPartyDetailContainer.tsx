'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useTabType } from '@/app/common/hooks';
import { useAuthGuard } from '@/app/auth/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { copyClipBoard } from '@/app/common/utils';
import { DetailTemplate } from '@/app/common/components/templates';
import { TabBar } from '@/app/common/components/molecules';
import { FeedList, BillCard, PartyCard } from '@/app/common/components/organisms';
import { GlassAvatar } from '@/app/common/components/atoms';
import { Button } from '@/app/common/components/ui/button';
import { BILL_TAB, BILL_TAB_KO } from '@/app/bill/constants';
import { patchBookmark } from '@/app/bill/services/apis';
import { billKeys } from '@/app/bill/hooks';
import {
  useGetPartyDetail,
  useGetPartyCongressman,
  useInfinitePartyBills,
  useMutatePartyFollow,
} from '@/app/party/hooks';
import type { ValueOf } from '@/app/common/types';
import type { BillResponse } from '@/app/bill/validation';
import { IconArrowDown, IconArrowUp } from '@/public/svgs';

const EMPTY_BILLS: BillResponse[] = [];

const BILL_TABS = [
  { label: BILL_TAB_KO.representProposer, value: BILL_TAB.representProposer },
  { label: BILL_TAB_KO.publicProposer, value: BILL_TAB.publicProposer },
];

const CONGRESSMAN_PREVIEW_COUNT = 8;

export default function NewPartyDetailContainer({ partyId }: { partyId: number }) {
  const { requireLogin } = useAuthGuard();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const queryClient = useQueryClient();

  const [billType, setBillType] = useTabType<typeof BILL_TAB>(BILL_TAB.representProposer);
  const [showAllCongressman, setShowAllCongressman] = useState(false);

  const { data: party } = useGetPartyDetail(partyId);
  const { data: congressmanData } = useGetPartyCongressman(partyId);
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfinitePartyBills(
    partyId,
    billType as ValueOf<typeof BILL_TAB>,
  );
  const mutationFollow = useMutatePartyFollow(partyId);

  const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? EMPTY_BILLS, [data]);

  const congressmanList = congressmanData?.party_congressman ?? [];
  const displayedCongressman = showAllCongressman
    ? congressmanList
    : congressmanList.slice(0, CONGRESSMAN_PREVIEW_COUNT);

  const handleFollow = useCallback(() => {
    if (!requireLogin()) return;

    const nextChecked = !party.followed;
    setSnackbar({
      show: true,
      type: nextChecked ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextChecked ? '해당 정당을 팔로우했습니다.' : '해당 정당의 팔로우를 취소했습니다.',
      duration: 3000,
    });
    mutationFollow.mutate(nextChecked);
  }, [party.followed, requireLogin, setSnackbar, mutationFollow]);

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
    <DetailTemplate hero={<PartyCard party={party} onFollow={handleFollow} variant="full" />}>
      {/* Congressman grid */}
      {congressmanList.length > 0 && (
        <section className="px-5">
          <h3 className="mb-3 text-lg font-semibold">소속 의원</h3>
          <div className="grid grid-cols-4 gap-3 justify-items-center md:grid-cols-8 lg:grid-cols-4">
            {displayedCongressman.map((c) => (
              <Link
                key={c.congressman_id}
                href={`/congressman/${c.congressman_id}`}
                className="flex flex-col items-center gap-1">
                <GlassAvatar size="md" src={c.congressman_image_url} fallback={c.congressman_name?.[0]} />
                <p className="text-xs text-center">{c.congressman_name}</p>
              </Link>
            ))}
          </div>
          {congressmanList.length > CONGRESSMAN_PREVIEW_COUNT && (
            <div className="flex justify-center mt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAllCongressman((prev) => !prev)}
                className="p-0">
                {showAllCongressman ? <IconArrowUp /> : <IconArrowDown />}
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Bill feed */}
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
