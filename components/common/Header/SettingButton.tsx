'use client';

import { IconSetting } from '@/public/svgs';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, useDisclosure } from '@nextui-org/react';
import { WithdrawModal } from '@/components/Modal';

export default function SettingButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <WithdrawModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent">
            <IconSetting />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem onClick={() => onOpen()} key="Withdrawal" className="text-sm ">
            회원탈퇴
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
