import Link from 'next/link';
import Image from 'next/image';
import { PartyLogoReplacement } from '@/app/party/components';

export default function PartyLogo({
  party_id,
  party_name,
  party_image_url,
}: {
  party_id: number;
  party_name: string;
  party_image_url: string;
}) {
  return (
    <Link href={party_image_url !== null ? `/party/${party_id.toString()}` : ''} className="">
      {party_image_url !== null ? (
        <>
          <Image
            className="dark:hidden object-contain w-[64px] h-[30px]"
            src={process.env.NEXT_PUBLIC_IMAGE_URL + party_image_url}
            width={64}
            height={30}
            alt={`${party_name} 로고 이미지`}
          />
          <Image
            className="hidden dark:block object-contain w-[64px] h-[30px]"
            src={process.env.NEXT_PUBLIC_IMAGE_URL + party_image_url.replace('wide', 'dark')}
            width={64}
            height={30}
            alt={`${party_name} 로고 이미지`}
          />
        </>
      ) : (
        <PartyLogoReplacement partyName={party_name} circle={false} />
      )}
    </Link>
  );
}
