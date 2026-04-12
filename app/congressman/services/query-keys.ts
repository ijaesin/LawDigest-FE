export const congressmanKeys = {
  root: () => ['congressman'] as const,
  detail: (congressmanId: string) => [...congressmanKeys.root(), 'detail', congressmanId] as const,
  billFeed: (congressmanId: string, type: string) =>
    [...congressmanKeys.root(), 'billFeed', congressmanId, type] as const,
};
