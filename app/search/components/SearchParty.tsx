import Link from 'next/link';
import { EnterButton } from '@/app/common/components/Button';
import type { SearchCongressmanParty } from '@/app/search/validation';
import PartyLogo from '@/app/common/components/PartyLogo';

export default function SearchParty({ party_id, party_name, party_image_url }: SearchCongressmanParty) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <PartyLogo
          partyName={party_name}
          partyImageUrl={party_image_url}
          variant="wide"
          imageWidth={80}
          imageHeight={32}
        />
        <p className="text-lg font-semibold">{party_name}</p>
      </div>
      <Link href={`/party/${party_id}`}>
        <EnterButton />
      </Link>
    </div>
  );
}
