export const timelineKeys = {
  root: () => ['timeline'] as const,
  feed: () => [...timelineKeys.root(), 'feed'] as const,
  billState: () => [...timelineKeys.root(), 'billState'] as const,
};
