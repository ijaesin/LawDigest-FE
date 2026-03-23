import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationList } from '@/app/common/components/organisms/NotificationList';
import type { Notification } from '@/app/notification/validation';

const today = new Date().toISOString();
const lastWeek = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const lastMonth = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

const mockNotifications: Notification[] = [
  {
    notification_id: 1,
    title: '법안 업데이트',
    content: '법안이 위원회 심사를 통과했습니다.',
    target: 'BILL001',
    type: 'bill_stage_update',
    extra: '',
    created_date: lastWeek,
    notification_image_url_list: [],
    read: false,
  },
  {
    notification_id: 2,
    title: '의원 팔로우 알림',
    content: '팔로우한 의원의 새 발의안',
    target: 'C001',
    type: 'congressman_party_update',
    extra: '',
    created_date: lastMonth,
    notification_image_url_list: [],
    read: true,
  },
];

describe('NotificationList', () => {
  const defaultProps = {
    onRead: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders notifications', () => {
    render(<NotificationList notifications={mockNotifications} {...defaultProps} />);
    expect(screen.getByText('법안 업데이트')).toBeInTheDocument();
    expect(screen.getByText('의원 팔로우 알림')).toBeInTheDocument();
  });

  it('groups by date', () => {
    render(<NotificationList notifications={mockNotifications} {...defaultProps} />);
    expect(screen.getByText('지난 한 주')).toBeInTheDocument();
    expect(screen.getByText('지난 한 달')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationList notifications={[]} {...defaultProps} />);
    expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
  });
});
