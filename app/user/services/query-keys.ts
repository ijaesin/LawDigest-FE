export const userKeys = {
  root: () => ['user'] as const,
  info: () => [...userKeys.root(), 'info'] as const,
  followingParty: () => [...userKeys.root(), 'followingParty'] as const,
  followingCongressman: () => [...userKeys.root(), 'followingCongressman'] as const,
  billBookmarkFeed: () => [...userKeys.root(), 'billBookmarkFeed'] as const,
  billBookmarkCount: () => [...userKeys.root(), 'billBookmarkCount'] as const,
};
