import { deleteWithdraw } from '@/app/auth/services';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

/**
 * @description 회원 탈퇴
 * @returns 회원 탈퇴 성공 여부
 */
export const useDeleteWithdraw = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  return useMutation({
    mutationFn: deleteWithdraw,
    ...options,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
