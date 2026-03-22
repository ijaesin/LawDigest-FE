import Link from 'next/link';
import Image from 'next/image';

type PartyLogoVariant = 'badge' | 'wide' | 'hero';

interface PartyLogoProps {
  partyName: string;
  partyImageUrl: string | null;
  partyId?: number;
  variant?: PartyLogoVariant;
  /** Image width in px (badge: 22, wide: 60, hero: 100 by default) */
  imageWidth?: number;
  /** Image height in px (badge: 22, wide: 30, hero: 45 by default) */
  imageHeight?: number;
  linkEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_DEFAULTS: Record<PartyLogoVariant, { containerClass: string; imageWidth: number; imageHeight: number }> =
  {
    badge: {
      containerClass: 'flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5',
      imageWidth: 22,
      imageHeight: 22,
    },
    wide: {
      containerClass: 'flex items-center',
      imageWidth: 60,
      imageHeight: 30,
    },
    hero: {
      containerClass: 'flex items-center justify-center shadow-lg rounded-full w-[130px] h-[130px] border',
      imageWidth: 100,
      imageHeight: 45,
    },
  };

export default function PartyLogo({
  partyName,
  partyImageUrl,
  partyId,
  variant = 'badge',
  imageWidth,
  imageHeight,
  linkEnabled = false,
  className = '',
  style,
}: PartyLogoProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const w = imageWidth ?? defaults.imageWidth;
  const h = imageHeight ?? defaults.imageHeight;

  const isCircular = variant === 'badge' || variant === 'hero';
  const containerClass = `${defaults.containerClass} ${partyName} ${className}`;

  const isFallback = !partyImageUrl || partyName === '무소속';

  const fallbackContent = isCircular ? (
    <span className="text-xs font-bold text-black dark:text-white">
      {partyName === '무소속' ? '무' : partyName.slice(0, 2)}
    </span>
  ) : (
    <span className="text-lg font-semibold text-center text-gray-3">{partyName}</span>
  );

  const content = isFallback ? (
    fallbackContent
  ) : (
    <>
      <Image
        className={`dark:hidden ${variant === 'wide' ? 'object-contain' : ''}`}
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImageUrl}`}
        alt={`${partyName} 로고 이미지`}
        width={w}
        height={h}
      />
      <Image
        className={`hidden dark:block ${variant === 'wide' ? 'object-contain' : ''}`}
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImageUrl.replace('wide', 'dark')}`}
        alt={`${partyName} 로고 이미지`}
        width={w}
        height={h}
      />
    </>
  );

  if (linkEnabled && partyId != null) {
    return (
      <Link href={`/party/${partyId}`} className={containerClass} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={containerClass} style={style}>
      {content}
    </div>
  );
}
