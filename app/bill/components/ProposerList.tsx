import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { sortByParty } from '@/app/common/utils';
import type { z } from 'zod';
import type { RepresentativeProposerSchema, PublicProposerSchema } from '@/app/bill/validation';

type RepresentativeProposer = z.infer<typeof RepresentativeProposerSchema>;
type PublicProposer = z.infer<typeof PublicProposerSchema>;

interface ProposerListProps {
  representativeProposerList: RepresentativeProposer[];
  publicProposerList: PublicProposer[];
  variant?: 'default' | 'popover';
}

const compareByName = (a: string[], b: string[]) => a[1].localeCompare(b[1]);

export default function ProposerList({
  representativeProposerList,
  publicProposerList,
  variant = 'default',
}: ProposerListProps) {
  const representativeProposerLength = representativeProposerList.length;
  const publicProposerLength = publicProposerList.length;
  const proposerListByParty = sortByParty({ publicProposerList });

  return (
    <Card className={`lg:shadow-none ${variant === 'popover' ? 'shadow-none dark:lg:bg-transparent' : ''}`}>
      <CardHeader>
        <p className="font-medium">
          {representativeProposerLength === 1
            ? representativeProposerList[0].representative_proposer_name
            : representativeProposerList
                .map(({ representative_proposer_name }) => representative_proposer_name)
                .join('·')}{' '}
          <span className="text-sm font-normal">{`등 ${publicProposerLength}인`}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 my-[18px]">
          {proposerListByParty.map(({ party, proposers }) => (
            <div key={party} className="flex gap-10 items-center">
              <div className="relative">
                <Link
                  href={`/party/${proposers[0][0]}`}
                  className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg shrink-0 border-1.5 ${party}`}>
                  {party === '무소속' ? (
                    <div className="text-xs font-medium text-foreground">무소속</div>
                  ) : (
                    <>
                      <Image
                        className="dark:hidden"
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${proposers[0][1]}`}
                        width={30}
                        height={30}
                        alt={`${party} 로고 이미지`}
                      />
                      <Image
                        className="hidden dark:block"
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${proposers[0][1].replace('wide', 'dark')}`}
                        width={30}
                        height={30}
                        alt={`${party} 로고 이미지`}
                      />
                    </>
                  )}
                </Link>
                <Badge variant="destructive" className="absolute -top-1 -right-2">
                  {proposers.length - 1}
                </Badge>
              </div>
              <div className="grid grid-cols-5 text-sm gap-x-[10px] gap-y-1">
                {proposers
                  .slice(1)
                  .toSorted(compareByName)
                  .map((proposer) => (
                    <Link href={`/congressman/${proposer[0]}`} key={proposer[0]} className="whitespace-nowrap">
                      {proposer[1].length === 2 ? (
                        <div className="flex justify-between">
                          {proposer[1].split('').map((char) => (
                            <p key={char}>{char}</p>
                          ))}
                        </div>
                      ) : (
                        proposer[1]
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
