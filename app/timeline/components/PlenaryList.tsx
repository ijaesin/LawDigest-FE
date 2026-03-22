'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { ProcessResult } from '@/app/bill/components';
import type { PlenaryItem } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from '@/app/common/components/PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

export default function PlenaryList({ plenary_list }: { plenary_list: PlenaryItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(plenary_list);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">본회의 심사</h3>
          {plenary_list.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안 <span className="text-black dark:text-white">{plenary_list.length}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpen(true)}>
                <IconEnter />
              </Button>
              <TimelineModal open={isOpen} onOpenChange={setIsOpen} title="심의한 법안">
                <div className="flex flex-col gap-4">
                  {plenary_list.map(({ bill_info }) => (
                    <div key={bill_info.bill_id} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{bill_info.bill_name}</p>
                      <div className="flex gap-[18px] items-center">
                        <PartyLogo
                          partyName={bill_info.party_info[0].party_name}
                          partyImageUrl={bill_info.party_info[0].party_image_url}
                        />
                        <div className="flex flex-col gap-1">
                          <Link href={`/bill/${bill_info.bill_id}`}>
                            <p className="text-xs font-bold">{bill_info.bill_brief_summary}</p>
                          </Link>
                          <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">
                            {bill_info.bill_proposers}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TimelineModal>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item, index) => (
            <Card key={item.bill_info.bill_id} className="overflow-visible z-10 md:shadow-none md:border">
              <CardContent className="overflow-visible py-3">
                <PartyLogo
                  partyName={item.bill_info.party_info[0].party_name}
                  partyImageUrl={item.bill_info.party_info[0].party_image_url}
                  className="absolute -left-[39px] bg-white dark:bg-dark-b md:hidden"
                  style={index > 0 ? { top: `${index * 50}px` } : undefined}
                />
                <div className="flex flex-col gap-2 w-full md:h-full md:justify-between">
                  <Link href={`/bill/${item.bill_info.bill_id}`}>
                    <p className="text-sm font-bold">{item.bill_info.bill_brief_summary}</p>
                  </Link>
                  <div className="flex items-center gap-[6px]">
                    <Badge variant="outline" className="text-xs">
                      {item.bill_info.bill_stage}
                    </Badge>
                    <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">
                      {item.bill_info.bill_proposers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      {plenary_list.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <ProcessResult
              bill_result={item.bill_info.bill_result}
              key={item.bill_info.bill_id}
              approval_count={item.approval_vote_count}
              total_vote_count={item.total_vote_count}
              party_vote_list={item.party_vote_list}
            />
          ))}
        </div>
      )}

      <TimelinePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="w-full md:w-[calc(100%-40px)] mx-auto"
      />
    </section>
  );
}
