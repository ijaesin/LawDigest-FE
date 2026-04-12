import { GlassSeparator } from '@/app/common/components/atoms';
import { AppLayout } from './AppLayout';

export interface DetailTemplateProps {
  hero: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DetailTemplate({ hero, children, sidebar }: DetailTemplateProps) {
  return (
    <AppLayout rightSidebar={sidebar}>
      <div className="flex flex-col gap-6 py-4">
        {hero}
        <GlassSeparator />
        {children}
      </div>
    </AppLayout>
  );
}
