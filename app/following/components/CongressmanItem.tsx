// app/following/components/CongressmanItem.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import { PartyLogoReplacement } from '@/app/party/components';
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
            {congressman_name} <span className="font-normal xl:text-lg xl:dark:text-gray-1">의원</span>
          </Link>
          <p className="text-gray-2 text-[10px] font-medium xl:text-sm">{party_name}</p>
        </div>
      </div>

      {party_image_url !== null ? (
        <Link href={`/party/${party_id}`} className="hidden xl:block">
          <Image
            className="dark:hidden"
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
            width={60}
            height={20}
            alt={`${party_name} 로고 이미지`}
          />
          <Image
            className="hidden dark:block"
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
            width={60}
            height={20}
            alt={`${party_name} 로고 이미지`}
          />
        </Link>
      ) : (
        <div className="hidden xl:block">
          <PartyLogoReplacement partyName={party_name} circle={false} />
        </div>
      )}
    </div>
  );
}
