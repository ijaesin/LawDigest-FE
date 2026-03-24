'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/app/auth/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { copyClipBoard } from '@/app/common/utils';
import { GlassCard, GlassAvatar } from '@/app/common/components/atoms';
import { StatCard } from '@/app/common/components/molecules';
import { FeedList, BillCard } from '@/app/common/components/organisms';
import {
  useGetUserInfo,
  useGetFollowingParty,
  useGetFollowingCongressman,
  useInfiniteBillBookmarked,
  useGetBillBookmarkedCount,
  userKeys,
} from '@/app/user/hooks';
import { patchBookmark } from '@/app/bill/services/apis';
import LogoutButton from '@/app/user/components/LogoutButton';
import type { BillResponse } from '@/app/bill/validation';

const EMPTY_BILLS: BillResponse[] = [];

export default function NewMyPageContainer() {
  const { requireLogin } = useAuthGuard();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const queryClient = useQueryClient();

  const { data: userInfo } = useGetUserInfo();
  const { data: partyList } = useGetFollowingParty();
  const { data: congressmanList } = useGetFollowingCongressman();
  const { data: bookmarkCount } = useGetBillBookmarkedCount();
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillBookmarked();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);

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
        queryClient.invalidateQueries({ queryKey: userKeys.billBookmarkFeed() });
        queryClient.invalidateQueries({ queryKey: userKeys.billBookmarkCount() });
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
    <div className="flex flex-col gap-6 py-4">
      {/* User profile section */}
      <GlassCard level="medium" className="flex items-center gap-4">
        <GlassAvatar size="xl" src={userInfo.user_image_url} fallback={userInfo.user_name?.[0]} />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{userInfo.user_name}</h2>
            <LogoutButton />
          </div>
          <p className="text-sm text-muted-foreground">{userInfo.user_email}</p>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="스크랩한 법안" value={bookmarkCount.count} />
        <StatCard label="팔로우한 의원" value={congressmanList.length} />
      </div>

      {/* Party list */}
      {partyList.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">
            팔로우한 정당 <span className="text-muted-foreground">{partyList.length}</span>
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {partyList.map((party) => (
              <Link key={party.party_id} href={`/party/${party.party_id}`} className="shrink-0">
                <GlassCard level="subtle" hover className="flex items-center gap-3">
                  <GlassAvatar
                    size="md"
                    partyName={party.party_name}
                    src={party.party_image_url}
                    fallback={party.party_name?.[0]}
                  />
                  <p className="truncate text-sm font-semibold">{party.party_name}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Congressman list */}
      {congressmanList.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">
            팔로우한 의원 <span className="text-muted-foreground">{congressmanList.length}</span>
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {congressmanList.map((c) => (
              <Link key={c.congressman_id} href={`/congressman/${c.congressman_id}`} className="shrink-0">
                <GlassCard level="subtle" hover className="flex items-center gap-3">
                  <GlassAvatar
                    size="md"
                    partyName={c.party_name}
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${c.congressman_image_url}`}
                    fallback={c.congressman_name?.[0]}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.congressman_name}</p>
                    <p className="text-xs text-muted-foreground">{c.party_name}</p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bookmarked bills */}
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">
          스크랩한 법안 <span className="text-muted-foreground">{bookmarkCount.count}</span>
        </h3>
        <FeedList
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          isLoading={isFetching}
          emptyMessage="스크랩한 법안이 없습니다">
          {bills.map((bill) => (
            <BillCard key={bill.bill_info_dto.bill_id} bill={bill} onBookmark={handleBookmark} onShare={handleShare} />
          ))}
        </FeedList>
      </section>
    </div>
  );
}
