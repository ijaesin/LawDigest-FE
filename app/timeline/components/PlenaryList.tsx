'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody, Chip, Pagination, Button, useDisclosure } from '@nextui-org/react';
import { ProcessResult } from '@/app/bill/[id]/components';
import { useState } from 'react';
import { IconEnter, IconNext, IconPrev } from '@/public/svgs';
import TimelineModal from './TimelineModal';

export default function PlenaryList({
  plenary_list,
}: {
  plenary_list: {
    bill_info: {
      party_info: {
        party_id: number;
        party_name: string;
        party_image_url: string;
      }[];
      bill_id: string;
      bill_name: string;
      bill_stage: string;
      bill_proposers: string;
      bill_brief_summary: string;
    };
    approval_vote_count: number;
    total_vote_count: number;
    party_vote_list: {
      party_info: {
        party_id: number;
        party_name: string;
        party_image_url: string;
      };
      party_approval_count: number;
    }[];
  }[];
}) {
  // 본회의심사
  const [currentPage, setCurrentPage] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between">
          <h3 className="text-[26px] font-extralight">본회의 심의</h3>
          {plenary_list.length !== 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2">
                심의한 법안 <span className="text-black">{plenary_list.length}개</span>
              </p>
              <Button isIconOnly size="sm" className="w-4 h-4 p-0 bg-transparent" onClick={() => onOpen()}>
                <IconEnter />
              </Button>
              <TimelineModal isOpen={isOpen} onClose={onClose}>
                <div className="flex flex-col gap-3">
                  {plenary_list.map(({ bill_info: { party_info, bill_id, bill_proposers, bill_brief_summary } }) => (
                    <div key={bill_id} className="flex gap-[18px] items-center">
                      <Link
                        href={`/party/${party_info[0].party_id}`}
                        className={`flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${party_info[0].party_name}`}>
                        <Image
                          src={process.env.NEXT_PUBLIC_IMAGE_URL + party_info[0].party_image_url}
                          alt={`${party_info[0].party_name} 로고 이미지`}
                          width={22}
                          height={22}
                        />
                      </Link>
                      <div className="flex flex-col gap-1">
                        <Link href={`/bill/${plenary_list[currentPage].bill_info.bill_id}`}>
                          <p className="text-xs font-bold">{bill_brief_summary}</p>
                        </Link>
                        <p className="text-xs font-semibold text-gray-2">{bill_proposers}</p>
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
        <Card className="z-10 overflow-visible">
          <CardBody className="py-3 overflow-visible">
            {plenary_list.length !== 0 ? (
              <div className="flex items-center justify-between">
                <Link
                  href={`/party/${plenary_list[currentPage].bill_info.party_info[0].party_id}`}
                  className={`absolute -left-[39px] flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 bg-white ${plenary_list[currentPage].bill_info.party_info[0].party_name}`}>
                  <Image
                    src={
                      process.env.NEXT_PUBLIC_IMAGE_URL +
                      plenary_list[currentPage].bill_info.party_info[0].party_image_url
                    }
                    alt={`${plenary_list[currentPage].bill_info.party_info[0].party_name} 로고 이미지`}
                    width={22}
                    height={22}
                  />
                </Link>
                <Button
                  isIconOnly
                  size="sm"
                  className="p-0 bg-transparent"
                  onPress={() => setCurrentPage((prev) => (prev > 0 ? prev - 1 : plenary_list.length - 1))}>
                  <IconPrev />
                </Button>
                <div className="flex flex-col w-full gap-2">
                  <Link href={`/bill/${plenary_list[currentPage].bill_info.bill_id}`}>
                    <p className="text-sm font-bold">{plenary_list[currentPage].bill_info.bill_brief_summary}</p>
                  </Link>
                  <div className="flex items-center gap-[6px]">
                    <Chip
                      variant="bordered"
                      className="text-xs border-gray-1 text-gray-2 border-[1px]"
                      size="sm"
                      radius="sm">
                      {plenary_list[currentPage].bill_info.bill_stage}
                    </Chip>
                    <p className="text-xs font-semibold text-gray-2">
                      {plenary_list[currentPage].bill_info.bill_proposers}
                    </p>
                  </div>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  className="p-0 bg-transparent"
                  onPress={() => setCurrentPage((prev) => (prev < plenary_list.length - 1 ? prev + 1 : 0))}>
                  <IconNext />
                </Button>
              </div>
            ) : (
              <p className="text-sm font-bold text-center">심의한 법안이 없습니다.</p>
            )}
          </CardBody>
        </Card>
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5]">
          <CardBody />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px]">
          <CardBody />
        </Card>
        {plenary_list.length !== 0 && (
          <div className="flex justify-center">
            <Pagination
              total={plenary_list.length}
              page={currentPage + 1}
              onChange={setCurrentPage}
              classNames={{
                item: 'bg-gray-1 text-transparent border-none shadow-none w-[6px] h-[6px]',
                cursor: 'bg-gray-3 text-transparent w-[6px] h-[6px]',
              }}
            />
          </div>
        )}
      </div>

      {plenary_list.length !== 0 && plenary_list[currentPage].party_vote_list && (
        <ProcessResult
          approval_count={plenary_list[currentPage].approval_vote_count}
          total_vote_count={plenary_list[currentPage].total_vote_count}
          party_vote_list={plenary_list[currentPage].party_vote_list}
        />
      )}
    </div>
  );
}