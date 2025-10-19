'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/app/common/components/ui/card';
import { Button } from '@/app/common/components/ui/button';
import type { CommitteeAudit } from '@/app/timeline/validation';
import { IconEnter, IconNext, IconPrev } from '@/public/svgs';
import TimelineModal from './TimelineModal';

export default function CommitteeAuditList({ committee_audit_list }: { committee_audit_list: CommitteeAudit[] }) {
  // 위원회심사
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isOpenIndividual, setIsOpenIndividual] = useState(false);
  const [isOpenAll, setIsOpenAll] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = committee_audit_list.slice(startIndex, endIndex);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">위원회 심사</h3>
          {committee_audit_list.length !== 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안{' '}
                <span className="text-black dark:text-white">
                  {committee_audit_list.reduce((pre, cur) => pre + cur.bill_outline_dto_list.length, 0)}개
                </span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpenAll(true)}>
                <IconEnter />
              </Button>
              <TimelineModal isOpen={isOpenAll} onClose={() => setIsOpenAll(false)}>
                <div className="flex flex-col gap-4">
                  {committee_audit_list.map(({ committee_name, bill_outline_dto_list }) => (
                    <div key={committee_name} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{committee_name}</p>
                      <div className="flex flex-col gap-3">
                        {bill_outline_dto_list.map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                          <div key={bill_id} className="flex gap-[18px] items-center">
                            <Link
                              href={`/party/${party_info[0].party_id}`}
                              className={`flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${party_info[0].party_name}`}>
                              {party_info[0].party_name === '무소속' ? (
                                <span className="text-xs font-bold text-black dark:text-white">무</span>
                              ) : (
                                <>
                                  <Image
                                    className="dark:hidden"
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url}`}
                                    alt={`${party_info[0].party_name} 로고 이미지`}
                                    width={22}
                                    height={22}
                                  />
                                  <Image
                                    className="hidden dark:block"
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url.replace('wide', 'dark')}`}
                                    alt={`${party_info[0].party_name} 로고 이미지`}
                                    width={22}
                                    height={22}
                                  />
                                </>
                              )}
                            </Link>
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
              {committee_audit_list.length !== 0 && (
                <CardHeader>
                  <p className="text-[22px] font-bold">{item.committee_name}</p>
                </CardHeader>
              )}
              <CardContent>
                {committee_audit_list.length !== 0 ? (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center">
                      <p className="text-xs font-medium text-gray-2 dark:text-gray-3">
                        심사한 법안 <span className="text-black dark:text-white">{item.bill_count}개</span>
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-0 w-4 h-4"
                        onClick={() => setIsOpenIndividual(true)}>
                        <IconEnter />
                      </Button>
                      <TimelineModal isOpen={isOpenIndividual} onClose={() => setIsOpenIndividual(false)}>
                        <div className="flex flex-col gap-3">
                          {item.bill_outline_dto_list.map(
                            ({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                              <div key={bill_id} className="flex gap-[18px] items-center">
                                <Link
                                  href={`/party/${party_info[0].party_id}`}
                                  className={`flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${party_info[0].party_name}`}>
                                  {party_info[0].party_name === '무소속' ? (
                                    <span className="text-xs font-bold text-black dark:text-white">무</span>
                                  ) : (
                                    <>
                                      <Image
                                        className="dark:hidden"
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url}`}
                                        alt={`${party_info[0].party_name} 로고 이미지`}
                                        width={22}
                                        height={22}
                                      />
                                      <Image
                                        className="hidden dark:block"
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url.replace('wide', 'dark')}`}
                                        alt={`${party_info[0].party_name} 로고 이미지`}
                                        width={22}
                                        height={22}
                                      />
                                    </>
                                  )}
                                </Link>
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
                            <Link
                              href={`/party/${party_info[0].party_id}`}
                              className={`flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${party_info[0].party_name}`}>
                              {party_info[0].party_name === '무소속' ? (
                                <span className="text-xs font-bold text-black dark:text-white">무</span>
                              ) : (
                                <>
                                  <Image
                                    className="dark:hidden"
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url}`}
                                    alt={`${party_info[0].party_name} 로고 이미지`}
                                    width={22}
                                    height={22}
                                  />
                                  <Image
                                    className="hidden dark:block"
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_info[0].party_image_url.replace('wide', 'dark')}`}
                                    alt={`${party_info[0].party_name} 로고 이미지`}
                                    width={22}
                                    height={22}
                                  />
                                </>
                              )}
                            </Link>
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
                ) : (
                  <p className="text-sm font-bold text-center">심사한 법안이 없습니다.</p>
                )}
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

      {committee_audit_list.length !== 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="p-0"
            onClick={() =>
              setCurrentPage((prev) => (prev > 0 ? prev - 1 : committee_audit_list.length / itemsPerPage - 1))
            }>
            <IconPrev />
          </Button>
          <div className="flex gap-1 items-center">
            {Array.from({ length: Math.ceil(committee_audit_list.length / itemsPerPage) }).map((_, i) => (
              <button
                type="button"
                key={currentPage}
                className={`w-1.5 h-1.5 rounded-full ${currentPage === i ? 'bg-gray-3' : 'bg-gray-1'}`}
                onClick={() => setCurrentPage(i)}
                aria-label={`${i + 1}페이지로 이동`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0"
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(committee_audit_list.length / itemsPerPage) - 1 ? prev + 1 : 0,
              )
            }>
            <IconNext />
          </Button>
        </div>
      )}
    </section>
  );
}
