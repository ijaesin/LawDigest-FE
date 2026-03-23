import { Check, Circle } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';
import { PROGRESS_STAGE_KO } from '@/app/bill/constants';

const STAGES = Object.values(PROGRESS_STAGE_KO);

export interface ProgressStepsProps {
  currentStage: string;
}

export function ProgressSteps({ currentStage }: ProgressStepsProps) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="flex flex-col gap-0">
      {STAGES.map((stage, idx) => {
        const isCompleted = currentIndex > idx;
        const isCurrent = currentIndex === idx;

        return (
          <div key={stage} className="flex items-start gap-3">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              {isCompleted && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon icon={Check} size="sm" />
                </div>
              )}
              {isCurrent && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon icon={Circle} size="sm" />
                </div>
              )}
              {!isCompleted && !isCurrent && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground text-muted-foreground">
                  <span className="text-xs">{idx + 1}</span>
                </div>
              )}
              {/* Connecting line */}
              {idx < STAGES.length - 1 && (
                <div className={cn('h-6 w-0.5', isCompleted ? 'bg-primary' : 'bg-muted-foreground/30')} />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                'pt-0.5 text-sm',
                isCompleted && 'text-primary',
                isCurrent && 'font-bold text-primary',
                !isCompleted && !isCurrent && 'text-muted-foreground',
              )}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}
