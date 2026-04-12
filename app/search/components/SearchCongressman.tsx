import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import type { SearchCongressmanParty } from '@/app/search/validation';
import { EnterButton } from '@/app/common/components/Button';

export default function SearchCongressman({
  congressman_id,
  congressman_image_url,
  congressman_name,
  party_name,
}: SearchCongressmanParty) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-6">
        <Avatar className="w-16 h-16 border">
          <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + congressman_image_url} />
          <AvatarFallback>{congressman_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{congressman_name}</p>
          <p className="text-sm font-medium text-muted-foreground">{party_name}</p>
        </div>
      </div>
      <Link href={`/congressman/${congressman_id}`}>
        <EnterButton />
      </Link>
    </div>
  );
}
