import Link from 'next/link';
import Image from 'next/image';
import type { PartyInfo } from '@/app/timeline/validation';

interface PartyLogoProps {
  partyInfo: PartyInfo;
  size?: number;
  linkEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PartyLogo({ partyInfo, size = 22, linkEnabled = true, className = '', style }: PartyLogoProps) {
  const containerClass = `flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${partyInfo.party_name} ${className}`;

  const content =
    partyInfo.party_name === '무소속' ? (
      <span className="text-xs font-bold text-black dark:text-white">무</span>
    ) : (
      <>
        <Image
          className="dark:hidden"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyInfo.party_image_url}`}
          alt={`${partyInfo.party_name} 로고 이미지`}
          width={size}
          height={size}
        />
        <Image
          className="hidden dark:block"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyInfo.party_image_url.replace('wide', 'dark')}`}
          alt={`${partyInfo.party_name} 로고 이미지`}
          width={size}
          height={size}
        />
      </>
    );

  if (!linkEnabled) {
    return (
      <div className={containerClass} style={style}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/party/${partyInfo.party_id}`} className={containerClass} style={style}>
      {content}
    </Link>
  );
}
