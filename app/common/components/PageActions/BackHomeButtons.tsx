'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/common/components/ui/button';

interface Props {
  /** 뒤로가기/홈 이동 후 router.refresh() 호출 여부 */
  refresh?: boolean;
}

export default function BackHomeButtons({ refresh = false }: Props) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
    if (refresh) router.refresh();
  };

  const handleHome = () => {
    router.push('/');
    if (refresh) router.refresh();
  };

  return (
    <div className="flex flex-col md:flex-row gap-[10px]">
      <Button
        className="text-xl font-medium text-white rounded-none bg-primary-3 w-[261px] md:w-[227px] h-[56px] dark:bg-dark-pb lg:dark:bg-dark-b"
        onClick={handleBack}>
        이전 페이지
      </Button>
      <Button
        variant="outline"
        className="text-xl font-medium rounded-none w-[261px] md:w-[227px] h-[56px] dark:text-black"
        onClick={handleHome}>
        홈으로
      </Button>
    </div>
  );
}
