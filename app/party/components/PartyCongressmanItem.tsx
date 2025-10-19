import Link from 'next/link';
import type { PartyCongressman } from '@/app/party/validation';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';

export default function PartyCongressmanItem({
  congressman_id,
  congressman_name,
  congressman_image_url,
}: PartyCongressman) {
  return (
    <Link href={`/congressman/${congressman_id}`} className="flex flex-col gap-2 items-center">
      <Avatar className="w-20 h-20 border-2 dark:border-dark-l">
        <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${congressman_image_url}`} />
        <AvatarFallback>{congressman_name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-3 dark:text-gray-2">의원</p>
        <p className="font-medium">{congressman_name}</p>
      </div>
    </Link>
  );
}
