import { GlassCard } from '@/app/common/components/ui/glass-card';

interface SectionContainerProps {
  title?: string;
  children: React.ReactNode;
}

export default function SectionContainer({ title, children }: SectionContainerProps) {
  return (
    <GlassCard className="flex flex-col gap-6">
      {title && <h3 className="text-[22px] md:text-[24px] font-semibold leading-[1.3]">{title}</h3>}
      {children}
    </GlassCard>
  );
}
