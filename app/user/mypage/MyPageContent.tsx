'use client';

import { CongressmanList, UserInfo, PartyList, BillContainer } from '@/app/user/components';
import { Separator } from '@/app/common/components/ui/separator';

export default function MyPageContent() {
  return (
    <div className="flex flex-col gap-8">
      <UserInfo />
      <div className="flex flex-col gap-8">
        <PartyList />
        <Separator className="mx-[30px] bg-border" />
        <CongressmanList />
        <Separator className="mx-[30px] bg-border" />
        <BillContainer />
      </div>
    </div>
  );
}
