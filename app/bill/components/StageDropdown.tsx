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
import type { ValueOf } from '@/app/common/types';

export default function StageDropdown({
  type,
  clickHandler,
}: {
  type: ValueOf<typeof STAGE_TAB_KO>;
  clickHandler: (value: string) => void;
}) {
  const stageArray = [{ label: '전체', value: 'all' }];
  const categoryValues = siteConfig.stageTabs;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          {type}
          <IconControl />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={type} onValueChange={clickHandler}>
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
