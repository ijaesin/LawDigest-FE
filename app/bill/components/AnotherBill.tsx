'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import PartyLogo from '@/app/common/components/PartyLogo';

export default function AnotherBill({
  billBriefSummary,
  billId,
  billProposers,
  billStage,
  party,
}: {
  billBriefSummary: string;
  billId: string;
  billProposers: string;
  billStage: string;
  party: {
    party_id: number;
    party_image_url: string;
    party_name: string;
  }[];
}) {
  const isRepresentativeSolo = party.length === 1;
  const partyName = isRepresentativeSolo ? party[0].party_name : '다수';

  return (
    <Card className={`border-1.5 flex-row md:py-2 ${partyName} rounded-md`}>
      <CardContent className="flex gap-2 justify-between">
        <Link href={`/bill/${billId}`}>
          <p className="text-sm font-bold lg:text-lg">{billBriefSummary}</p>
        </Link>
        <div className="flex gap-2 items-center w-full">
          <Badge variant="outline" className="text-xs lg:text-sm">
            {billStage}
          </Badge>
          <h4 className="text-xs font-semibold lg:text-sm text-gray-2 shrink-0">{billProposers}</h4>
        </div>
      </CardContent>
      <CardFooter className="flex overflow-visible justify-center pl-0 basis-1/4 shrink-0">
        {isRepresentativeSolo ? (
          <PartyLogo
            partyName={party[0].party_name}
            partyImageUrl={party[0].party_image_url}
            partyId={party[0].party_id}
            variant="wide"
            imageWidth={60}
            imageHeight={30}
            linkEnabled
            className="object-contain w-[60px] h-[30px] lg:w-[120px] lg:h-[30px]"
          />
        ) : (
          <div className="flex -space-x-4">
            {party.map(({ party_image_url, party_id, party_name }) =>
              party_image_url !== null ? (
                <Link href={`/party/${party_id}`} key={party_id}>
                  <Avatar className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
                    <AvatarImage
                      className="object-contain dark:hidden"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
                    />
                    <AvatarImage
                      className="hidden object-contain dark:block"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
                    />
                    <AvatarFallback>{party_name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar key={party_id} className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
                  <AvatarFallback>{party_name[0]}</AvatarFallback>
                </Avatar>
              ),
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
