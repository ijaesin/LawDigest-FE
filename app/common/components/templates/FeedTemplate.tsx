'use client';

import { TabBar } from '@/app/common/components/molecules';
import { AppLayout } from './AppLayout';

export interface FeedTemplateProps {
  tabs?: { label: string; value: string }[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function FeedTemplate({ tabs, activeTab, onTabChange, sidebar, children }: FeedTemplateProps) {
  return (
    <AppLayout rightSidebar={sidebar}>
      <div className="flex flex-col gap-4 py-4">
        {tabs && activeTab && onTabChange && <TabBar tabs={tabs} activeValue={activeTab} onChange={onTabChange} />}
        {children}
      </div>
    </AppLayout>
  );
}
