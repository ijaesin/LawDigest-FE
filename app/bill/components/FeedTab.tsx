import { Tabs, TabsList, TabsTrigger } from '@/app/common/components/ui/tabs';
import { siteConfig } from '@/app/common/config/site';
import { FEED_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';

export default function FeedTab({
  value,
  onValueChange,
}: {
  value: ValueOf<typeof FEED_TAB>;
  onValueChange: (value: string) => void;
}) {
  const values = siteConfig.feedTabs;

  return (
    <section>
      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        <TabsList className="grid grid-cols-2 p-0 w-full h-auto bg-transparent">
          {values.map(({ label, value: tabValue }) => (
            <TabsTrigger
              key={FEED_TAB[tabValue as keyof typeof FEED_TAB]}
              value={FEED_TAB[tabValue as keyof typeof FEED_TAB]}
              className="w-full h-[36px] text-base font-medium data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-full">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
