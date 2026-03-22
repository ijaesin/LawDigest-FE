'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconNotification } from '@/public/svgs';
import { useGetNotificationCount } from '@/app/notification/hooks';
import { useAuthGuard } from '@/app/auth/hooks';
import { Button } from '@/app/common/components/ui/button';

export default function NotificationButton() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, requireLogin } = useAuthGuard();
  const { data: notificationCount } = useGetNotificationCount({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" onClick={() => requireLogin()}>
        <IconNotification />
      </Button>
    );
  }

  const hasNotification = notificationCount && notificationCount.notification_count > 0;

  return (
    <Link href="/notification">
      <div className="relative">
        <IconNotification />
        {hasNotification && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
      </div>
    </Link>
  );
}
