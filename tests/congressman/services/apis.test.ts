import { describe, it, expect } from 'vitest';
import { getCongressmanDetail, patchCongressmanFollow, getBillByCongressman } from '@/app/congressman/services/apis';

describe('congressman API 함수', () => {
  describe('getCongressmanDetail', () => {
    it('의원 상세 정보를 반환하고 Zod 스키마를 통과한다', async () => {
      const result = await getCongressmanDetail('1');
      expect(result.congressman_id).toBe('1');
      expect(result.congressman_name).toBe('홍길동');
      expect(result.party_name).toBe('테스트당');
    });
  });

  describe('patchCongressmanFollow', () => {
    it('팔로우 토글 결과를 반환한다', async () => {
      const result = await patchCongressmanFollow('1', true);
      expect(result.congressman_id).toBe('1');
      expect(result.like_checked).toBe(true);
    });
  });

  describe('getBillByCongressman', () => {
    it('법안 목록을 반환한다', async () => {
      const result = await getBillByCongressman(0, '1', 'represent_proposer');
      expect(result.bill_list).toEqual([]);
      expect(result.pagination_response.last_page).toBe(true);
    });
  });
});
