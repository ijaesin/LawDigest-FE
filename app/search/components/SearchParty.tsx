import Link from 'next/link';
import Image from 'next/image';
import { EnterButton } from '@/app/common/components/Button';
import type { SearchCongressmanParty } from '@/app/search/validation';
import PartyLogoReplacement from '@/app/party/components/PartyLogoReplacement';

export default function SearchParty({ party_id, party_name, party_image_url }: SearchCongressmanParty) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-6 items-center">
        {party_image_url !== null ? (
          <div
            className={`flex justify-center items-center w-[54px] h-[54px] border overflow-hidden rounded-full ${party_name}`}>
            <Image
              className="dark:hidden"
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
              width={40}
              height={16}
              alt={`${party_name} 로고 이미지`}
            />
            <Image
              className="hidden dark:block"
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
              width={40}
              height={16}
              alt={`${party_name} 로고 이미지`}
            />
          </div>
        ) : (
          <PartyLogoReplacement partyName={party_name} circle />
        )}
        <p className="text-lg font-semibold">{party_name}</p>
      </div>
      <Link href={`/party/${party_id}`}>
        <EnterButton />
      </Link>
    </div>
  );
}
