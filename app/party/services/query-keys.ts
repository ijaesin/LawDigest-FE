export const partyKeys = {
  root: () => ['party'] as const,
  detail: (partyId: number) => [...partyKeys.root(), 'detail', partyId] as const,
  billFeed: (partyId: number, type: string) => [...partyKeys.root(), 'billFeed', partyId, type] as const,
  congressman: (partyId: number) => [...partyKeys.root(), 'congressman', partyId] as const,
  executive: (partyId: number) => [...partyKeys.root(), 'executive', partyId] as const,
};
