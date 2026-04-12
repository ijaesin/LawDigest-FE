export const billKeys = {
  root: () => ['bill'] as const,
  mainfeed: (stage?: string) => [...billKeys.root(), 'mainfeed', stage ?? 'all'] as const,
  popular: () => [...billKeys.root(), 'popular'] as const,
  detail: (billId: string) => [...billKeys.root(), 'detail', billId] as const,
  viewCount: (billId: string) => [...billKeys.root(), 'view_count', billId] as const,
  bookmarkCount: () => [...billKeys.root(), 'bookmark', 'count'] as const,
};
