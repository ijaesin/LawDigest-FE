'use client';

import { CongressmanList, UserInfo, PartyList, BillContainer } from '@/app/user/components';

export default function MyPageContent() {
  return (
    <div className="flex flex-col gap-8 h-full lg:flex-row md:items-center lg:items-start lg:justify-center lg:mt-10 lg:mx-auto lg:ml-10 xl:ml-0">
      <UserInfo />
      <div className="flex flex-col gap-8 h-full">
        <PartyList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <CongressmanList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <BillContainer />
      </div>
    </div>
  );
}
