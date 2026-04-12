import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { NotificationList } from '@/app/common/components/organisms';

const today = new Date().toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

const mockNotifications = [
  {
    notification_id: 1,
    title: '법안 업데이트',
    content: '국민건강보험법이 위원회를 통과했습니다.',
    target: 'BILL001',
    type: 'bill_stage_update',
    extra: '',
    created_date: threeDaysAgo,
    notification_image_url_list: [],
    read: false,
  },
  {
    notification_id: 2,
    title: '의원 활동',
    content: '팔로우한 의원이 새 법안을 발의했습니다.',
    target: 'C001',
    type: 'congressman_party_update',
    extra: '',
    created_date: twoWeeksAgo,
    notification_image_url_list: [],
    read: true,
  },
];

const meta: Meta<typeof NotificationList> = {
  title: 'Organisms/NotificationList',
  component: NotificationList,
  args: {
    onRead: fn(),
    onDelete: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof NotificationList>;

export const Default: Story = {
  args: { notifications: mockNotifications },
};

export const Empty: Story = {
  args: { notifications: [] },
};
