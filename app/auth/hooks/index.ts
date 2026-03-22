import { deleteWithdraw, postLogout } from '@/app/auth/services';
import { deleteCookie } from 'cookies-next';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { userKeys } from '@/app/user/services/query-keys';

export { useAuthGuard } from './useAuthGuard';

/**
 * @description 회원 탈퇴
 */
export const useDeleteWithdraw = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWithdraw,
    ...options,
    onSuccess: (data, variables, context) => {
      deleteCookie(ACCESS_TOKEN);
      queryClient.removeQueries();
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

/**
 * @description 로그아웃
 */
export const usePostLogout = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postLogout(),
    ...options,
    onSuccess: (data, variables, context) => {
      deleteCookie(ACCESS_TOKEN);
      queryClient.removeQueries({ queryKey: userKeys.root() });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
