import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimelineEntry } from '@/app/common/components/organisms';

const meta: Meta<typeof TimelineEntry> = {
  title: 'Organisms/TimelineEntry',
  component: TimelineEntry,
};
export default meta;
type Story = StoryObj<typeof TimelineEntry>;

export const WithPlenaryAndCommittee: Story = {
  args: {
    entry: {
      date: '2025-03-15',
      bill_count: 5,
      plenary_list: [
        {
          bill_info: {
            bill_id: 'B001',
            bill_name: '국민건강보험법 일부개정법률안',
            bill_stage: '본회의',
            bill_proposers: '김민수',
            bill_brief_summary: '건강보험 보장성 강화',
            bill_result: '',
            party_info: [],
          },
          approval_vote_count: 180,
          total_vote_count: 200,
          party_vote_list: [],
        },
      ],
      promulgation_list: [],
      committee_audit_list: [{ committee_name: '법제사법위원회', bill_count: 3, bill_outline_dto_list: [] }],
      submitted_list: [],
    },
  },
};

export const SubmittedOnly: Story = {
  args: {
    entry: {
      date: '2025-03-10',
      bill_count: 2,
      plenary_list: [],
      promulgation_list: [],
      committee_audit_list: [],
      submitted_list: [
        {
          bill_id: 'B002',
          bill_name: '교육기본법 개정안',
          bill_stage: '접수',
          bill_proposers: '이의원',
          bill_brief_summary: '교육 개혁',
          bill_result: '',
          party_info: [],
        },
      ],
    },
  },
};
