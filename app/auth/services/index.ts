import { apiClient } from '@/app/common/lib';
import { extractApiMessage } from '@/app/common/validation/api.schema';

/**
 * @description 회원 탈퇴
 * @returns void
 * @see DELETE /auth/user/withdraw
 */
export const deleteWithdraw = async (): Promise<void> => {
  try {
    await apiClient.delete(`/auth/user/withdraw`);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 로그아웃
 * @see POST /logout
 */
export const postLogout = async (): Promise<void> => {
  try {
    await apiClient.post('/logout');
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
