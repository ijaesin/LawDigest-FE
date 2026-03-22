import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  TimelineFeedSchema,
  TimelineBillStateSchema,
  type TimelineFeed,
  type TimelineBillState,
} from '@/app/timeline/validation';

/**
 * @description 타임라인 피드 조회 (무한스크롤)
 * @param page - 페이지 번호 (0부터 시작)
 * @see GET /time-line/feed/paging
 */
export const getTimelineFeed = async (page: number): Promise<TimelineFeed> => {
  try {
    const data = await apiClient.get<TimelineFeed>('/time-line/feed/paging', { params: { page, size: 3 } });
    return TimelineFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 타임라인 전체 법안 현황 통계 조회
 * @see GET /time-line/bill-state
 */
export const getTimelineBillState = async (): Promise<TimelineBillState> => {
  try {
    const data = await apiClient.get<TimelineBillState>('/time-line/bill-state', { params: { size: 3 } });
    return TimelineBillStateSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
