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
              className="w-full h-[36px] text-base font-medium rounded-full text-muted-foreground hover:text-foreground transition-all duration-[var(--duration-normal)] ease-[var(--easing-default)] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
