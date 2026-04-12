import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import { FollowingCongressman } from '@/app/user/validation';

export default function CongressmanItem({
  congressman_id,
  congressman_name,
  congressman_image_url,
  party_name,
}: FollowingCongressman) {
  return (
    <Link href={`/congressman/${congressman_id}`} className="flex flex-col gap-1 items-center">
      <Avatar className="w-16 h-16 border-1.5">
        <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + congressman_image_url} />
        <AvatarFallback>{congressman_name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <p className="text-xs font-medium text-gray-2 dark:text-[#999999]">{party_name}</p>
        <p className="text-sm font-medium">{congressman_name}</p>
      </div>
    </Link>
  );
}
