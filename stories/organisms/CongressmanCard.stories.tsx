import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { CongressmanCard } from '@/app/common/components/organisms';

const mockCongressman = {
  congressman_id: 'C001',
  congressman_name: '김민수',
  party_id: 1,
  party_name: '더불어민주당',
  party_image_url: '',
  elect_sort: '지역구',
  district: '서울 강남구',
  commits: '',
  elected: '초선',
  homepage: '',
  represent_count: 15,
  public_count: 42,
  congressman_image_url: '',
  like_checked: false,
  office: '',
  email: '',
  age: 55,
  gender: '남',
  follow_count: 128,
  brief_history: '',
  telephone: '',
};

const meta: Meta<typeof CongressmanCard> = {
  title: 'Organisms/CongressmanCard',
  component: CongressmanCard,
  args: {
    onFollow: fn(),
    congressman: mockCongressman,
  },
};
export default meta;
type Story = StoryObj<typeof CongressmanCard>;

export const Full: Story = {};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const Following: Story = {
  args: {
    congressman: { ...mockCongressman, like_checked: true },
  },
};
