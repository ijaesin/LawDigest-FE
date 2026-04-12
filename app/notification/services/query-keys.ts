export const notificationKeys = {
  root: () => ['notifications'] as const,
  list: () => [...notificationKeys.root()] as const,
  count: () => [...notificationKeys.root(), 'count'] as const,
  topThree: () => [...notificationKeys.root(), 'top3'] as const,
};
