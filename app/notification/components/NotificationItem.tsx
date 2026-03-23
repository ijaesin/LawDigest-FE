'use client';

import Link from 'next/link';
import getTimeRemaining from '@/app/common/utils/getTimeRemaining';
import type { Notification } from '@/app/notification/validation';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/common/components/ui/dropdown-menu';
import { Button } from '@/app/common/components/ui/button';
import { IconAlert, IconKebab } from '@/public/svgs';

export default function NotificationItem({
  title,
  content,
  created_date,
  type,
  notification_image_url_list,
  target,
  read,
  notification_id,
  onRead,
  onNavigateRead,
  onDelete,
}: Notification & {
  onRead: (notificationId: number) => void;
  onNavigateRead: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
}) {
  const imageUrlList = notification_image_url_list
    .filter((str): str is string => typeof str === 'string' && str.length > 0)
    .map((str) => {
      const [party = '', url = ''] = str.split(':');
      return { party, url };
    });
  const isRepresentativeSolo = imageUrlList.length === 1;
  const linkUrl = `${type === 'congressman_party_update' ? 'congressman' : 'bill'}/${target}`;

  return (
    <section className="flex items-center gap-[10px] lg:gap-4">
      <div className="flex gap-1 items-center">
        <div className={read ? 'invisible' : ''}>
          <IconAlert />
        </div>

        {isRepresentativeSolo ? (
          <Avatar
            className={`w-[50px] h-[50px] border ${imageUrlList[0].party} ${
              type === 'bill_stage_update' || type === 'bill_result_update' ? 'bg-white p-1' : ''
            }`}>
            {imageUrlList[0].url ? (
              <>
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrlList[0].url}`}
                  className={`${
                    type === 'bill_stage_update' || type === 'bill_result_update' ? 'object-contain' : ''
                  } dark:hidden`}
                />
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrlList[0].url.replace('wide', 'dark')}`}
                  className={`${
                    type === 'bill_stage_update' || type === 'bill_result_update' ? 'object-contain' : ''
                  } hidden dark:block`}
                />
              </>
            ) : null}
            <AvatarFallback>{imageUrlList[0].party?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`flex -space-x-4 w-[50px] ${imageUrlList.length >= 3 ? 'gap-0' : ''}`}>
            {imageUrlList.slice(0, 3).map(({ party, url }) => (
              <Avatar key={`${party}-${url}`} className="p-1 bg-white border shrink-0">
                {url ? (
                  <>
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${url}`}
                      className="object-contain dark:hidden"
                    />
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${url.replace('wide', 'dark')}`}
                      className="hidden object-contain dark:block"
                    />
                  </>
                ) : null}
                <AvatarFallback>{party?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-1 w-full">
          <Link href={linkUrl} onClick={() => onNavigateRead(notification_id)}>
            <p className="text-xs font-bold md:text-base">
              {title} &nbsp;
              <span className="text-[10px] md:text-sm font-medium text-muted-foreground">
                {getTimeRemaining(created_date)}
              </span>
            </p>
          </Link>
          <p className="text-muted-foreground text-[10px] md:text-sm">{content}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconKebab isPassed />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRead(notification_id)}>읽음 표시</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(notification_id)}>삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
