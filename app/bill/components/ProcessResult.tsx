'use client';

import { Card, CardHeader, CardContent } from '@/app/common/components/ui/card';
import { Separator } from '@/app/common/components/ui/separator';
import HalfDonutChart from './HalfDonutChart';
import VoteResultBoard from './VoteResultBoard';

export default function ProcessResult({
  bill_result,
  approval_count,
  total_vote_count,
  party_vote_list,
}: {
  bill_result?: string;
  approval_count: number;
  total_vote_count: number;
  party_vote_list: {
    party_info: {
      party_id: number;
      party_name: string;
      party_image_url: string;
    };
    party_approval_count: number;
  }[];
}) {
  switch (bill_result) {
    case '대안반영폐기':
      return (
        <Card className="px-6 py-10 md:shadow-none md:border dark:lg:bg-dark-pb">
          <CardHeader className="flex justify-center">
            <p className="text-lg font-semibold lg:text-xl">{bill_result}</p>
          </CardHeader>
          <CardContent className="text-center">이 법안의 전체 혹은 일부가 위원회 대안에 반영되었어요!</CardContent>
        </Card>
      );
    case '임기만료폐기':
      return (
        <Card className="px-6 py-10 md:shadow-none md:border dark:lg:bg-dark-pb">
          <CardHeader className="flex justify-center">
            <p className="text-lg font-semibold lg:text-xl">{bill_result}</p>
          </CardHeader>
          <CardContent className="text-center">국회의원 임기가 만료되어 자동으로 폐기되었어요</CardContent>
        </Card>
      );
    case '철회':
      return (
        <Card className="px-6 py-10 md:shadow-none md:border dark:lg:bg-dark-pb">
          <CardHeader className="flex justify-center">
            <p className="text-lg font-semibold lg:text-xl">{bill_result}</p>
          </CardHeader>
          <CardContent className="text-center">발의한 의원이 이 법안을 철회했어요</CardContent>
        </Card>
      );
    case '원안가결':
    case '수정가결':
    case '부결':
      return (
        <Card className="flex overflow-visible flex-col items-center p-4 md:shadow-none md:border dark:lg:bg-dark-pb">
          <HalfDonutChart
            billResult={bill_result}
            approvalCount={approval_count}
            totalVoteCount={total_vote_count}
            partyVoteList={party_vote_list}
          />
          <Separator className="my-4" />
          <VoteResultBoard party_vote_list={party_vote_list} />
        </Card>
      );
    default:
      return (
        <p className="text-sm text-gray-2 md:h-[200px] lg:h-auto lg:text-base dark:text-gray-3 text-center">
          투표 정보가 없습니다.
        </p>
      );
  }
}
