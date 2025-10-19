import { z } from 'zod';

// TODO(lawdigest): 임시 완화 — 응답 계약 확정 후 엄격화 필요

/**
 * @description Notification 단일 항목 스키마
 */
export const NotificationSchema = z
  .object({
    title: z.string().optional().default(''),
    notification_id: z.coerce.number().int(),
    content: z.string().optional().default(''),
    target: z.string().optional().default(''),
    type: z.string().optional().default(''),
    extra: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    created_date: z.string().optional().default(''),
    notification_image_url_list: z
      .array(z.string())
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    read: z
      .boolean()
      .optional()
      .transform((v) => !!v),
  })
  .strict();

/**
 * @description Notification 배열 스키마
 */
export const NotificationListSchema = z.array(NotificationSchema);

/**
 * @description 읽지 않은 알림 개수 응답 스키마
 */
export const NotificationCountSchema = z
  .object({ user_id: z.coerce.number().int(), notification_count: z.coerce.number().int().min(0) })
  .strict();

// Types
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationList = z.infer<typeof NotificationListSchema>;
export type NotificationCount = z.infer<typeof NotificationCountSchema>;
