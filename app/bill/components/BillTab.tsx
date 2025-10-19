import { Tabs, TabsList, TabsTrigger } from '@/app/common/components/ui/tabs';
import { siteConfig } from '@/app/common/config/site';
import { BILL_TAB } from '@/app/bill/constants';
import { ValueOf } from '@/app/common/types';
import { Key } from 'react';

export default function BillTab({
  type,
  clickHandler,
}: {
  type: ValueOf<typeof BILL_TAB>;
  clickHandler: (key: Key) => void;
}) {
  const values = siteConfig.billTabs;

  return (
    <section className="w-full lg:min-w-[840px]">
      <Tabs value={type} onValueChange={clickHandler} className="w-full">
        <TabsList className="p-0 w-full h-auto bg-transparent rounded-none border-b border-divider">
          {values.map(({ label, value }) => (
            <TabsTrigger
              key={BILL_TAB[value as keyof typeof BILL_TAB]}
              value={BILL_TAB[value as keyof typeof BILL_TAB]}
              className="px-0 h-10 mx-2 text-base font-medium bg-transparent shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:text-black dark:data-[state=active]:text-white">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
