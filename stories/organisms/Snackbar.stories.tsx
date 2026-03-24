import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Snackbar } from '@/app/common/components/organisms';
import { useSnackbarStore } from '@/app/common/store';

function SnackbarDemo({ type, message }: { type: string; message: string }) {
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  useEffect(() => {
    setSnackbar({ show: true, type: type as any, message, duration: null });
  }, [setSnackbar, type, message]);
  return <Snackbar />;
}

const meta: Meta<typeof SnackbarDemo> = {
  title: 'Organisms/Snackbar',
  component: SnackbarDemo,
};
export default meta;
type Story = StoryObj<typeof SnackbarDemo>;

export const Success: Story = {
  args: { type: 'success', message: '성공적으로 저장되었습니다.' },
};

export const Error: Story = {
  args: { type: 'error', message: '오류가 발생했습니다.' },
};

export const Info: Story = {
  args: { type: 'info', message: '새로운 알림이 있습니다.' },
};

export const Cancel: Story = {
  args: { type: 'cancel', message: '작업이 취소되었습니다.' },
};
