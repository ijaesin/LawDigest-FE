'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { useSnackbarStore } from '@/app/common/store';
import { IconCancel } from '@/public/svgs';

export default function Snackbar() {
  // 각 필드를 개별 선택자로 구독해 스냅샷 안정성 보장
  const show = useSnackbarStore((s) => s.show);
  const type = useSnackbarStore((s) => s.type);
  const message = useSnackbarStore((s) => s.message);
  const duration = useSnackbarStore((s) => s.duration);
  const resetSnackbar = useSnackbarStore((s) => s.resetSnackbar);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (show) {
      const timer = setTimeout(
        () => {
          resetSnackbar();
        },
        duration !== null && duration !== undefined ? duration : 3000,
      );

      return () => {
        clearTimeout(timer);
      };
    }
  }, [show, duration, resetSnackbar]);

  return (
    <section
      aria-live="assertive"
      className="flex fixed inset-0 justify-center items-end px-4 py-20 w-full pointer-events-none">
      <div
        className={`transform transition ${
          show
            ? 'ease-out duration-300 translate-y-0 opacity-100 sm:translate-x-0'
            : 'ease-in duration-100 translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
        }`}>
        <div
          className={`pointer-events-auto w-full max-w-xl overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${type}`}>
          <div className="flex items-center px-4 py-3">
            <p className="flex-1 w-0 text-sm font-semibold text-white lg:text-base">{message}</p>
            {message === '로그인이 필요한 서비스입니다.' && (
              <Link href="/auth/login" className="mr-2">
                <p className="text-xs font-medium text-white underline lg:text-sm">로그인 하기</p>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={resetSnackbar}>
              <IconCancel />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
