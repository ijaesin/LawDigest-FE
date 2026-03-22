'use client';

import Image from 'next/image';
import { BillProps } from '@/app/bill/types';
import { Card, CardContent, CardFooter } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/app/common/components/ui/popover';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/app/common/components/ui/tooltip';
import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import PartyLogo from '@/app/common/components/PartyLogo';
import { ProposerList } from '@/app/bill/components';

export default function BillBookmarked({
  bill_info_dto: { bill_id, brief_summary, bill_stage },
  representative_proposer_dto_list,
  public_proposer_dto_list,
}: BillProps) {
  const isRepresentativeSolo = representative_proposer_dto_list.length === 1;
  const partyName = isRepresentativeSolo ? representative_proposer_dto_list[0].party_name : '다수';

  return (
    <Card className={`border-1.5 flex-row md:py-2 ${partyName} rounded-md`}>
      <CardContent className="flex gap-2 justify-between">
        <Link href={`/bill/${bill_id}`}>
          <p className="text-sm font-bold md:text-base lg:text-lg">{brief_summary}</p>
        </Link>
        <div className="flex overflow-visible flex-wrap gap-2 items-center w-full">
          <Badge variant="outline" className="text-xs md:text-sm">
            {bill_stage}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="p-0 m-0 h-min">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <h4 className="text-xs font-semibold md:text-sm text-gray-2 shrink-0">
                        {isRepresentativeSolo
                          ? `${representative_proposer_dto_list[0].representative_proposer_name} 의원 등 ${public_proposer_dto_list.length}인`
                          : `${representative_proposer_dto_list
                              .map(({ representative_proposer_name }) => representative_proposer_name)
                              .join('·')} 의원 등 ${public_proposer_dto_list.length}인`}
                      </h4>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>발의자 명단 보기</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <ProposerList
                representativeProposerList={representative_proposer_dto_list}
                publicProposerList={public_proposer_dto_list}
                variant="popover"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter className="flex overflow-visible justify-center pl-0 basis-1/4 md:basis-1/5 shrink-0">
        {isRepresentativeSolo ? (
          <PartyLogo
            partyName={representative_proposer_dto_list[0].party_name}
            partyImageUrl={representative_proposer_dto_list[0].party_image_url}
            partyId={representative_proposer_dto_list[0].party_id}
            variant="wide"
            imageWidth={60}
            imageHeight={30}
            linkEnabled
            className="object-contain w-[60px] h-[30px] md:w-[90px] md:h-[45px]"
          />
        ) : (
          <div className="flex -space-x-4">
            {representative_proposer_dto_list.map(({ party_image_url, party_id, party_name }) => (
              <Link href={`/party/${party_id}`} key={party_id}>
                <Avatar className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
                  <>
                    <AvatarImage
                      className="object-contain dark:hidden"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
                    />
                    <AvatarImage
                      className="hidden object-contain dark:block"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
                    />
                  </>
                  <AvatarFallback>{party_name[0]}</AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
