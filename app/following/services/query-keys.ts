export const followingKeys = {
  root: () => ['following'] as const,
  congressmanList: () => [...followingKeys.root(), 'congressmanList'] as const,
  billFeed: () => [...followingKeys.root(), 'billFeed'] as const,
};
