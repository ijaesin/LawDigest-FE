import Image from 'next/image';
import Link from 'next/link';
import { FollowingParty } from '@/app/user/validation';

export default function PartyItem({ party_id, party_name, party_image_url }: FollowingParty) {
  return (
    <Link href={`/party/${party_id}`}>
      <div
        className={`w-[140px] h-[102px] rounded-lg mr-[10px] border-1.5 flex justify-center items-center ${party_name}`}>
        <Image
          className="dark:hidden object-contain w-[100px] h-[35px] rounded-lg"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
          width={100}
          height={35}
          alt={`${party_name} 로고 이미지`}
        />
        <Image
          className="hidden dark:block object-contain w-[100px] h-[35px] rounded-lg"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
          width={100}
          height={35}
          alt={`${party_name} 로고 이미지`}
        />
      </div>
    </Link>
  );
}
