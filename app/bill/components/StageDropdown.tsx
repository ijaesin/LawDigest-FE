'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/app/common/components/ui/dropdown-menu';
import { Button } from '@/app/common/components/ui/button';
import { IconControl } from '@/public/svgs';
import { siteConfig } from '@/app/common/config/site';
import { STAGE_TAB, STAGE_TAB_KO } from '@/app/bill/constants';

export default function StageDropdown({
  selectedStage,
  onStageChange,
}: {
  selectedStage: string;
  onStageChange: (value: string) => void;
}) {
  const stageArray = [{ label: '전체', value: 'all' }];
  const categoryValues = siteConfig.stageTabs;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          {selectedStage}
          <IconControl />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={selectedStage} onValueChange={onStageChange}>
          {stageArray.concat(categoryValues).map(({ label, value }) => (
            <DropdownMenuRadioItem key={label} value={label}>
              {STAGE_TAB_KO[value as keyof typeof STAGE_TAB] || '전체'}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
