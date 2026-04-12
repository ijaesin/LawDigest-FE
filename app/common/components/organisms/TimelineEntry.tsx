import { convertDateFormat } from '@/app/common/utils';
import { GlassSeparator } from '@/app/common/components/atoms';
import type { TimelineResponseList } from '@/app/timeline/validation';

export interface TimelineEntryProps {
  entry: TimelineResponseList;
}

const sectionLabels: Record<string, string> = {
  plenary_list: '본회의 의결',
  promulgation_list: '공포',
  committee_audit_list: '위원회 심사',
  submitted_list: '접수',
};

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const { date, plenary_list, promulgation_list, committee_audit_list, submitted_list } = entry;
  const [month, day, dayName] = convertDateFormat(date);

  const sections = [
    { key: 'plenary_list', items: plenary_list },
    { key: 'promulgation_list', items: promulgation_list },
    { key: 'committee_audit_list', items: committee_audit_list },
    { key: 'submitted_list', items: submitted_list },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="flex gap-6" data-testid="timeline-entry">
      <GlassSeparator orientation="vertical" className="w-[2px] h-auto" />
      <div className="w-full pb-10">
        <div className="relative">
          <div className="absolute -left-[38px] top-5 h-[25px] w-[25px] rounded-full border border-foreground bg-muted" />
          <h2 className="flex items-baseline gap-2">
            <span className="text-[42px]">
              {month}.{day}
            </span>
            <span className="text-[22px]">{dayName}</span>
          </h2>
        </div>
        {sections.length > 0 && (
          <div className="mt-4 flex flex-col gap-5">
            {sections.map((section) => (
              <div key={section.key}>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{sectionLabels[section.key]}</h3>
                <p className="text-xs text-muted-foreground">{section.items.length}건</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
