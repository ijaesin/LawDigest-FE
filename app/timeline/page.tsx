import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';
import { TimelineContent } from './components';

// 타임라인 페이지는 런타임 데이터(외부 API)에 의존하므로
// 정적 프리렌더를 강제하지 않고 요청마다 동적으로 렌더링합니다.
export const dynamic = 'force-dynamic';

export default function Timeline() {
  return (
    <AppLayout>
      <TimelineContent />
    </AppLayout>
  );
}
