'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import { PartyLogoReplacement } from '@/app/party/components';

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
  const router = useRouter();

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
          <Link
            href={party[0].party_image_url !== null ? `/party/${party[0].party_id}` : '#'}
            onClick={(e) => {
              if (party[0].party_image_url === null) e.preventDefault();
            }}>
            {party[0].party_image_url !== null ? (
              <>
                <Image
                  className="dark:hidden object-contain w-[60px] h-[30px] lg:w-[120px] lg:h-[30px]"
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party[0].party_image_url}`}
                  width={60}
                  height={30}
                  alt={`${party[0].party_name} 이미지`}
                />
                <Image
                  className="hidden dark:block object-contain w-[60px] h-[30px] lg:w-[120px] lg:h-[30px]"
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party[0].party_image_url.replace('wide', 'dark')}`}
                  width={60}
                  height={30}
                  alt={`${party[0].party_name} 이미지`}
                />
              </>
            ) : (
              <PartyLogoReplacement partyName={party[0].party_name} circle={false} />
            )}
          </Link>
        ) : (
          <div className="flex -space-x-4">
            {party.map(({ party_image_url, party_id, party_name }) => (
              <Avatar
                key={party_id}
                className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (party_image_url !== null) router.push(`/party/${party_id}`);
                }}>
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
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
