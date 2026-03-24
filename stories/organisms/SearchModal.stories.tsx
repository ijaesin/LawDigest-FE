import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { SearchModal } from '@/app/common/components/organisms';
import { useSearchModalStore } from '@/app/common/store/search-modal';

function SearchModalOpen() {
  const open = useSearchModalStore((s) => s.open);
  useEffect(() => {
    open();
  }, [open]);
  return <SearchModal />;
}

const meta: Meta<typeof SearchModal> = {
  title: 'Organisms/SearchModal',
  component: SearchModal,
  parameters: {
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof SearchModal>;

export const Default: Story = {
  render: () => <SearchModalOpen />,
};
