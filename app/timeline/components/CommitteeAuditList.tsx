'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/app/common/components/ui/card';
import { Button } from '@/app/common/components/ui/button';
import type { CommitteeAudit } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from './PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

export default function CommitteeAuditList({ committee_audit_list }: { committee_audit_list: CommitteeAudit[] }) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [isOpenAll, setIsOpenAll] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(committee_audit_list);

  const totalBillCount = committee_audit_list.reduce((pre, cur) => pre + cur.bill_outline_dto_list.length, 0);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">위원회 심사</h3>
          {committee_audit_list.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안 <span className="text-black dark:text-white">{totalBillCount}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpenAll(true)}>
                <IconEnter />
              </Button>
              <TimelineModal
                open={isOpenAll}
                onOpenChange={setIsOpenAll}
                title="심사한 법안">
                <div className="flex flex-col gap-4">
                  {committee_audit_list.map(({ committee_name, bill_outline_dto_list }) => (
                    <div key={committee_name} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{committee_name}</p>
                      <div className="flex flex-col gap-3">
                        {bill_outline_dto_list.map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
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
          {currentItems.map((item) => (
            <Card key={item.committee_name} className="z-10 px-2 md:shadow-none md:border">
              <CardHeader>
                <p className="text-[22px] font-bold">{item.committee_name}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex items-center">
                    <p className="text-xs font-medium text-gray-2 dark:text-gray-3">
                      심사한 법안 <span className="text-black dark:text-white">{item.bill_count}개</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-0 w-4 h-4"
                      onClick={() => setOpenModal(item.committee_name)}>
                      <IconEnter />
                    </Button>
                    <TimelineModal
                      open={openModal === item.committee_name}
                      onOpenChange={(open) => setOpenModal(open ? item.committee_name : null)}
                      title={`${item.committee_name} 심사 법안`}>
                      <div className="flex flex-col gap-3">
                        {item.bill_outline_dto_list.map(
                          ({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                            <div key={bill_id} className="flex gap-[18px] items-center">
                              <PartyLogo partyInfo={party_info[0]} />
                              <div className="flex flex-col gap-1">
                                <Link href={`/bill/${bill_id}`}>
                                  <p className="text-xs font-bold">{bill_brief_summary}</p>
                                </Link>
                                <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </TimelineModal>
                  </div>
                  <div className="flex flex-col gap-3">
                    {item.bill_outline_dto_list
                      .slice(0, 5)
                      .map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
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

      <TimelinePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
}
