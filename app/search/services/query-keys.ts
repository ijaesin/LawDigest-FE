export const searchKeys = {
  root: () => ['search'] as const,
  congressmanParty: (searchWord: string) => [...searchKeys.root(), 'congressmanParty', searchWord] as const,
  bill: (searchWord: string) => [...searchKeys.root(), 'bill', searchWord] as const,
  recentKeywords: () => [...searchKeys.root(), 'recentKeywords'] as const,
};
