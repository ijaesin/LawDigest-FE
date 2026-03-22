'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import PartyLogo from '@/app/common/components/PartyLogo';
import type { FollowingCongressman } from '@/app/following/validation';

export default function CongressmanItem({
  congressman_id,
  congressman_name,
  congressman_image_url,
  party_id,
  party_name,
  party_image_url,
}: FollowingCongressman) {
  return (
    <div className="flex flex-col gap-2 items-center xl:flex-row xl:justify-between">
      <div className="gap-5 xl:flex xl:flex-row">
        <Link href={`/congressman/${congressman_id}`}>
          <Avatar className="w-14 h-14">
            <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${congressman_image_url}`} />
            <AvatarFallback>{congressman_name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col items-center shrink-0 xl:items-start">
          <Link href={`/congressman/${congressman_id}`} className="text-xs font-semibold xl:text-xl">
            {congressman_name} <span className="font-normal xl:text-lg">의원</span>
          </Link>
          <p className="text-muted-foreground text-[10px] font-medium xl:text-sm">{party_name}</p>
        </div>
      </div>

      <PartyLogo
        partyName={party_name}
        partyImageUrl={party_image_url}
        partyId={party_id}
        variant="wide"
        imageWidth={60}
        imageHeight={20}
        linkEnabled
        className="hidden xl:flex"
      />
    </div>
  );
}
