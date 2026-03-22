import type { z } from 'zod';
import type { PublicProposerSchema } from '@/app/bill/validation';

type PublicProposer = z.infer<typeof PublicProposerSchema>;

interface PartyGroup {
  party: string;
  proposers: string[][];
}

export default function sortByParty({ publicProposerList }: { publicProposerList: PublicProposer[] }): PartyGroup[] {
  const partyMap = new Map<string, string[][]>();

  publicProposerList
    .toSorted((a, b) => a.public_proposer_party_id - b.public_proposer_party_id)
    .forEach((proposer) => {
      const { public_proposer_id: id, public_proposer_name: name } = proposer;
      const { public_proposer_party_name: partyName } = proposer;
      const { public_proposer_party_id: partyId, public_proposer_party_image_url: partyLogo } = proposer;

      const existing = partyMap.get(partyName);
      if (existing) {
        existing.push([id, name]);
      } else {
        partyMap.set(partyName, [
          [String(partyId), partyLogo],
          [id, name],
        ]);
      }
    });

  const result: PartyGroup[] = [];
  partyMap.forEach((proposers, party) => {
    result.push({ party, proposers });
  });

  return result;
}
