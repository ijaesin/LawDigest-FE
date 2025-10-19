import { Tabs, TabsList, TabsTrigger } from '@/app/common/components/ui/tabs';
import { siteConfig } from '@/app/common/config/site';
import { FEED_TAB } from '@/app/bill/constants';
import type { Key } from 'react';
import type { ValueOf } from '@/app/common/types';

export default function FeedTab({
  type,
  clickHandler,
}: {
  type: ValueOf<typeof FEED_TAB>;
  clickHandler: (key: Key) => void;
}) {
  const values = siteConfig.feedTabs;

  return (
    <section className="">
      <Tabs value={type} onValueChange={clickHandler} className="w-full">
        <TabsList className="grid grid-cols-2 p-0 w-full h-auto bg-transparent">
          {values.map(({ label, value }) => (
            <TabsTrigger
              key={FEED_TAB[value as keyof typeof FEED_TAB]}
              value={FEED_TAB[value as keyof typeof FEED_TAB]}
              className="w-full h-[36px] text-base font-medium data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-full">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
