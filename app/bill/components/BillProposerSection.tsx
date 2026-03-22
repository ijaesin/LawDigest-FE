import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/common/components/ui/popover';
import { Button } from '@/app/common/components/ui/button';
import { Separator } from '@/app/common/components/ui/separator';
import { PartyLogoReplacement } from '@/app/party/components';
import type { BillResponse } from '@/app/bill/validation';
import ProposerList from './ProposerList';

type RepresentativeProposer = BillResponse['representative_proposer_dto_list'][number];
type PublicProposer = BillResponse['public_proposer_dto_list'][number];

export default function BillProposerSection({
  representativeProposerList,
  publicProposerList,
  detail,
  children,
}: {
  representativeProposerList: RepresentativeProposer[];
  publicProposerList: PublicProposer[];
  detail?: boolean;
  children?: React.ReactNode;
}) {
  const hasRepresentative = representativeProposerList.length > 0;
  const isRepresentativeSolo = representativeProposerList.length === 1;
  const firstRepresentative = hasRepresentative ? representativeProposerList[0] : undefined;
  const partyName = hasRepresentative
    ? isRepresentativeSolo
      ? (firstRepresentative?.party_name ?? '무소속')
      : '다수'
    : '정보 없음';

  return (
    <div className={`relative ${detail ? 'w-[320px] shrink-0' : 'hidden md:block'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {representativeProposerList.map(({ representative_proposer_id, represent_proposer_img_url }) => (
              <Avatar key={representative_proposer_id} className="border-2 border-white dark:border-dark-l">
                <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + represent_proposer_img_url} />
                <AvatarFallback>{representative_proposer_id}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {firstRepresentative?.representative_proposer_name ?? '대표 발의자 정보 없음'}
            </p>
            <div className="flex gap-1 items-center">
              <PartyLogoReplacement partyName={partyName} circle={false} />
              <p className="text-xs text-gray-2">{partyName}</p>
            </div>
          </div>
        </div>
        {hasRepresentative ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-7">
                {representativeProposerList.length}인
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <ProposerList
                representativeProposerList={representativeProposerList}
                publicProposerList={publicProposerList}
                variant="popover"
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      <Separator className="dark:bg-dark-l" />
      {children}
    </div>
  );
}
