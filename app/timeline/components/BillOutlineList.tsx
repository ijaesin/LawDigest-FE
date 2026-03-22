'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import type { BillOutline } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from './PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

type BillOutlineListVariant = 'submitted' | 'promulgation';

const VARIANT_CONFIG = {
  submitted: {
    title: '법안 접수',
    countLabel: '접수된 법안',
    emptyLabel: '접수된 법안이 없습니다.',
    modalTitle: '접수된 법안',
  },
  promulgation: {
    title: '법안 공포',
    countLabel: '공포한 법안',
    emptyLabel: '공포된 법안이 없습니다.',
    modalTitle: '공포된 법안',
  },
} as const;

interface BillOutlineListProps {
  variant: BillOutlineListVariant;
  bills: BillOutline[];
}

export default function BillOutlineList({ variant, bills }: BillOutlineListProps) {
  const config = VARIANT_CONFIG[variant];
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(bills);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">{config.title}</h3>
          {bills.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                {config.countLabel} <span className="text-black dark:text-white">{bills.length}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpen(true)}>
                <IconEnter />
              </Button>
              <TimelineModal open={isOpen} onOpenChange={setIsOpen} title={config.modalTitle}>
                <div className="flex flex-col gap-3">
                  {bills.map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                    <div key={bill_id} className="flex gap-[18px] items-center">
                      <PartyLogo partyInfo={party_info[0]} />
                      <div className="flex flex-col gap-1">
                        <Link href={`/bill/${bill_id}`}>
                          <p className="text-xs font-bold">{bill_brief_summary}</p>
                        </Link>
                        <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
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
        {bills.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item) => (
              <Card key={item.bill_id} className="overflow-visible z-10 md:shadow-none md:border">
                <CardContent className="overflow-visible py-3">
                  <PartyLogo
                    partyInfo={item.party_info[0]}
                    className="absolute -left-[39px] bg-white dark:bg-dark-b md:hidden"
                  />
                  <div className="flex flex-col gap-2 w-full md:h-full md:justify-between">
                    <Link href={`/bill/${item.bill_id}`}>
                      <p className="text-sm font-bold">{item.bill_brief_summary}</p>
                    </Link>
                    <div className="flex items-center gap-[6px]">
                      <Badge variant="outline" className="text-xs">
                        {item.bill_stage}
                      </Badge>
                      <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{item.bill_proposers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-visible z-10">
            <CardContent className="overflow-visible py-3">
              <p className="text-sm font-bold text-center">{config.emptyLabel}</p>
            </CardContent>
          </Card>
        )}
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      <TimelinePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
