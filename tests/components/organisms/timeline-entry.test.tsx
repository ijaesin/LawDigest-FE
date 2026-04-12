import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TimelineEntry } from '@/app/common/components/organisms/TimelineEntry';
import type { TimelineResponseList } from '@/app/timeline/validation';

const mockEntry: TimelineResponseList = {
  date: '2025-03-15',
  bill_count: 5,
  plenary_list: [
    {
      bill_info: {
        bill_id: 'B001',
        bill_name: '테스트 법안',
        bill_stage: '본회의',
        bill_proposers: '김의원',
        bill_brief_summary: '요약',
        bill_result: '',
        party_info: [],
      },
      approval_vote_count: 180,
      total_vote_count: 200,
      party_vote_list: [],
    },
  ],
  promulgation_list: [],
  committee_audit_list: [
    {
      committee_name: '법제사법위원회',
      bill_count: 3,
      bill_outline_dto_list: [],
    },
  ],
  submitted_list: [],
};

describe('TimelineEntry', () => {
  it('renders date', () => {
    render(<TimelineEntry entry={mockEntry} />);
    expect(screen.getByText(/3\.15/)).toBeInTheDocument();
  });

  it('renders section headers when data present', () => {
    render(<TimelineEntry entry={mockEntry} />);
    expect(screen.getByText('본회의 의결')).toBeInTheDocument();
    expect(screen.getByText('위원회 심사')).toBeInTheDocument();
    expect(screen.queryByText('공포')).not.toBeInTheDocument();
    expect(screen.queryByText('접수')).not.toBeInTheDocument();
  });
});
