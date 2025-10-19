'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { ProcessResult } from '@/app/bill/components';
import { useState, useEffect } from 'react';
import type { PlenaryItem } from '@/app/timeline/validation';
import { IconEnter, IconNext, IconPrev } from '@/public/svgs';
import TimelineModal from './TimelineModal';

export default function PlenaryList({ plenary_list }: { plenary_list: PlenaryItem[] }) {
  // 본회의심사
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

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
  const currentItems = plenary_list.slice(startIndex, endIndex);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">본회의 심사</h3>
          {plenary_list.length !== 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안 <span className="text-black dark:text-white">{plenary_list.length}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpen(true)}>
                <IconEnter />
              </Button>
              <TimelineModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="flex flex-col gap-4">
                  {plenary_list.map(({ bill_info }) => (
                    <div key={bill_info.bill_id} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{bill_info.bill_name}</p>
                      <div className="flex flex-col gap-3">
                        <div key={bill_info.bill_id} className="flex gap-[18px] items-center">
                          <Link
                            href={`/party/${bill_info.party_info[0].party_id}`}
                            className={`flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${bill_info.party_info[0].party_name}`}>
                            {bill_info.party_info[0].party_name === '무소속' ? (
                              <span className="text-xs font-bold text-black dark:text-white">무</span>
                            ) : (
                              <>
                                <Image
                                  className="dark:hidden"
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${bill_info.party_info[0].party_image_url}`}
                                  alt={`${bill_info.party_info[0].party_name} 로고 이미지`}
                                  width={22}
                                  height={22}
                                />
                                <Image
                                  className="hidden dark:block"
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${bill_info.party_info[0].party_image_url.replace('wide', 'dark')}`}
                                  alt={`${bill_info.party_info[0].party_name} 로고 이미지`}
                                  width={22}
                                  height={22}
                                />
                              </>
                            )}
                          </Link>
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
                    </div>
                  ))}
                </div>
              </TimelineModal>
            </div>
          )}
        </div>
      </div>
      <div>
        {plenary_list.length !== 0 ? (
          <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item, index) => (
              <Card key={item.bill_info.bill_id} className="overflow-visible z-10 md:shadow-none md:border">
                <CardContent className="overflow-visible py-3">
                  <Link
                    href={`/party/${item.bill_info.party_info[0].party_id}`}
                    className={`absolute -left-[39px] flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 bg-white dark:bg-dark-b md:hidden ${item.bill_info.party_info[0].party_name}`}
                    style={index > 0 ? { top: `${index * 50}px` } : {}}>
                    {item.bill_info.party_info[0].party_name === '무소속' ? (
                      <span className="text-xs font-bold text-black dark:text-white">무</span>
                    ) : (
                      <>
                        <Image
                          className="dark:hidden"
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.bill_info.party_info[0].party_image_url}`}
                          alt={`${item.bill_info.party_info[0].party_name} 로고 이미지`}
                          width={22}
                          height={22}
                        />
                        <Image
                          className="hidden dark:block"
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.bill_info.party_info[0].party_image_url.replace('wide', 'dark')}`}
                          alt={`${item.bill_info.party_info[0].party_name} 로고 이미지`}
                          width={22}
                          height={22}
                        />
                      </>
                    )}
                  </Link>
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
        ) : (
          <p className="text-sm font-bold text-center">심사한 법안이 없습니다.</p>
        )}
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      {plenary_list.length !== 0 && (
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

      {plenary_list.length !== 0 && (
        <div className="flex items-center justify-between w-full md:w-[calc(100%-40px)] mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="p-0"
            onClick={() =>
              setCurrentPage((prev) => (prev > 0 ? prev - 1 : Math.ceil(plenary_list.length / itemsPerPage) - 1))
            }>
            <IconPrev />
          </Button>
          <div className="flex gap-1 items-center">
            {Array.from({ length: Math.ceil(plenary_list.length / itemsPerPage) }).map((_, i) => (
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
              setCurrentPage((prev) => (prev < Math.ceil(plenary_list.length / itemsPerPage) - 1 ? prev + 1 : 0))
            }>
            <IconNext />
          </Button>
        </div>
      )}
    </section>
  );
}
