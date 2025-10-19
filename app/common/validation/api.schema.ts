import { z } from 'zod';

// TODO(lawdigest): 임시 완화 — 공통 에러 본문 파싱 시 일부 필드 누락/타입 불일치를 허용

export const ApiErrorSchema = z
  .object({
    message: z.string().optional().default('요청에 실패했습니다.'),
    code: z.string().optional().default('UNKNOWN'),
  })
  .passthrough();
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;

export function extractApiMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  // AxiosError 형태: error.response?.data
  const data = (error as any)?.response?.data;
  const parsed = ApiErrorSchema.safeParse(data);
  return parsed.success ? (parsed.data.message ?? fallback) : fallback;
}
