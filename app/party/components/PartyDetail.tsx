'use client';

import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import { Card } from '@/app/common/components/ui/card';
import { Separator } from '@/app/common/components/ui/separator';
import { IconWeb } from '@/public/svgs';
import {
  PARTY_NAME_KO,
  PARTY_POSITION,
  PARTY_LEADER,
  PARTY_FLOOR_LEADER,
  PARTY_SECRETARY_GENERAL,
  PARTY_POLISY_COMMITTEE_CHAIRMAN,
} from '@/app/party/constants';
import { useGetPartyDetail } from '@/app/party/hooks';
import FollowBoard from './FollowBoard';
import PartyLogo from '@/app/common/components/PartyLogo';

export default function PartyDetail({ partyId }: { partyId: number }) {
  const { data: party } = useGetPartyDetail(partyId);
  const {
    party_name,
    party_img_url,
    total_congressman_count,
    proportional_congressman_count,
    district_congressman_count,
    representative_bill_count,
    public_bill_count,
    follow_count,
    website_url,
    followed,
  } = party;
  const whole_representative_count = proportional_congressman_count + district_congressman_count;
  const seatRatio = ((100 * whole_representative_count) / total_congressman_count).toFixed(2);

  return (
    <section className="flex flex-col items-center mx-5 xl:mx-0 mt-5 gap-7 xl:w-[320px]">
      <Card className="flex flex-col gap-5 items-center pt-1 w-full bg-transparent border-none dark:bg-dark-b lg:dark:bg-dark-pb">
        <PartyLogo partyName={party_name} partyImageUrl={party_img_url} variant="hero" />

        <div className="flex flex-col gap-1 items-center">
          <h2 className="text-2xl font-semibold">{party_name}</h2>
          <h3 className="text-gray-3 dark:text-gray-2">{PARTY_POSITION[party_name as keyof typeof PARTY_NAME_KO]}</h3>
        </div>

        <div className="text-sm">
          <p>
            의석수: {whole_representative_count}석 / {total_congressman_count}석{' '}
            <span className="text-gray-2 dark:text-gray-3">{seatRatio}%</span>
          </p>
          <p>
            지역구 {district_congressman_count}석, 비례대표 {proportional_congressman_count}석
          </p>
        </div>
      </Card>

      <Separator className="dark:bg-dark-l" />

      <FollowBoard
        id={partyId}
        followed={followed}
        follow_count={follow_count}
        representative_bill_count={representative_bill_count}
        public_bill_count={public_bill_count}
      />

      <Separator className="dark:bg-dark-l" />

      <div className="grid grid-cols-4 justify-items-center w-full">
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">당대표</p>
          <p className="font-medium">{PARTY_LEADER[party_name as keyof typeof PARTY_NAME_KO] || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">원내대표</p>
          <p className="font-medium">{PARTY_FLOOR_LEADER[party_name as keyof typeof PARTY_NAME_KO] || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">사무총장</p>
          <p className="font-medium">{PARTY_SECRETARY_GENERAL[party_name as keyof typeof PARTY_NAME_KO] || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">정책위의장</p>
          <p className="font-medium">
            {PARTY_POLISY_COMMITTEE_CHAIRMAN[party_name as keyof typeof PARTY_NAME_KO] || '없음'}
          </p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-[135px] h-8 bg-transparent text-gray-2 border-gray-1 dark:border-gray-3 rounded-full">
        <Link href={website_url}>
          웹사이트 방문
          <IconWeb />
        </Link>
      </Button>
    </section>
  );
}
