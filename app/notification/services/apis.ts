import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  NotificationListSchema,
  NotificationCountSchema,
  type NotificationList,
  type NotificationCount,
} from '@/app/notification/validation';

/**
 * @description 전체 알림 목록 조회
 * @see GET /notification/user
 */
export const getNotification = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.get<NotificationList>('/notification/user');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 읽지 않은 알림 개수 조회
 * @see GET /notification/user/count
 */
export const getNotificationCount = async (): Promise<NotificationCount> => {
  try {
    const data = await apiClient.get<NotificationCount>('/notification/user/count');
    return NotificationCountSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 읽지 않은 알림 Top3 조회
 * @see GET /notification/user/top3-unread
 */
export const getNotificationTopThree = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.get<NotificationList>('/notification/user/top3-unread');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 특정 알림 읽음 처리
 * @param notificationId - 알림 ID
 * @see PUT /notification/user/read
 */
export const putNotificationRead = async (notificationId: number): Promise<NotificationList> => {
  try {
    const data = await apiClient.put<NotificationList>('/notification/user/read', undefined, {
      params: { notification_id: notificationId },
    });
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 모든 알림 읽음 처리
 * @see PUT /notification/user/read/all
 */
export const putNotificationReadAll = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.put<NotificationList>('/notification/user/read/all');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 특정 알림 삭제
 * @param notificationId - 알림 ID
 * @see DELETE /notification/user/delete
 */
export const deleteNotification = async (notificationId: number): Promise<NotificationList> => {
  try {
    const data = await apiClient.delete<NotificationList>('/notification/user/delete', {
      params: { notification_id: notificationId },
    });
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 모든 알림 삭제
 * @see DELETE /notification/user/delete/all
 */
export const deleteNotificationAll = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.delete<NotificationList>('/notification/user/delete/all');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
