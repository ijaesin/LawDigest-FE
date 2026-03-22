'use client';

import { useState, useCallback } from 'react';
import { useGetPartyCongressman } from '@/app/party/hooks';
import { Loader2 } from 'lucide-react';
import { Button } from '@/app/common/components/ui/button';
import { Separator } from '@/app/common/components/ui/separator';
import { IconArrowDown, IconArrowUp } from '@/public/svgs';
import PartyCongressmanItem from './PartyCongressmanItem';

export default function PartyCongressmanList({ partyId }: { partyId: number }) {
  const { data, isFetching } = useGetPartyCongressman(partyId);
  const [isOpened, setIsOpened] = useState(false);

  const onClickButton = useCallback(() => {
    setIsOpened((prev) => !prev);
  }, []);

  return (
    <section className="flex flex-col gap-5 mx-5 my-10">
      <div className="grid grid-cols-4 gap-y-3 justify-items-center w-full md:grid-cols-8 lg:grid-cols-4">
        {isOpened
          ? data?.party_congressman.map((congressman) => (
              <PartyCongressmanItem key={congressman.congressman_id} {...congressman} />
            ))
          : data?.party_congressman
              .slice(0, 8)
              .map((congressman) => (
                <PartyCongressmanItem key={congressman.congressman_id} {...congressman} />
              ))}
      </div>
      {isFetching && (
        <div className="flex justify-center my-4 w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <div
        className={`flex justify-center ${data?.party_congressman && data.party_congressman.length <= 8 ? 'hidden' : ''}`}>
        <Button variant="ghost" size="icon" onClick={onClickButton} className="p-0">
          {isOpened ? <IconArrowUp /> : <IconArrowDown />}
        </Button>
      </div>

      <Separator className="dark:bg-dark-l lg:hidden" />
    </section>
  );
}
