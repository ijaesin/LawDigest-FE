import CommonPartyLogo from '@/app/common/components/PartyLogo';

export default function PartyLogo({
  party_id,
  party_name,
  party_image_url,
}: {
  party_id: number;
  party_name: string;
  party_image_url: string | null;
}) {
  return (
    <CommonPartyLogo
      partyName={party_name}
      partyImageUrl={party_image_url}
      partyId={party_id}
      variant="wide"
      imageWidth={64}
      imageHeight={30}
      linkEnabled
    />
  );
}
