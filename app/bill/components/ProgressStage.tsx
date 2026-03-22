/* eslint-disable no-nested-ternary */
import { PROGRESS_STAGE_KO } from '@/app/bill/constants';
import { IconChecked, IconKebab, IconPointed } from '@/public/svgs';

export default function ProgressStage({ billStage }: { billStage: string }) {
  const progressStageList = Object.values(PROGRESS_STAGE_KO);
  const stageNum = progressStageList.indexOf(billStage) >= 0 ? progressStageList.indexOf(billStage) : 1;

  return (
    <section className="flex justify-center">
      <div>
        {progressStageList.map((stage, index) => (
          <div
            key={stage}
            className={`text-sm font-medium ${index < stageNum ? 'text-muted-foreground' : index > stageNum ? 'text-tertiary-foreground' : 'text-foreground'}`}>
            <div className="flex gap-7 items-center">
              {index < stageNum ? (
                <IconChecked />
              ) : index === stageNum ? (
                <IconPointed />
              ) : (
                <div className="flex justify-center items-center w-5 h-5 text-white rounded-full bg-muted text-muted-foreground">
                  {index + 1}
                </div>
              )}
              <p>STEP 0{index + 1}</p>
              <p>{stage}</p>
            </div>
            {index !== 5 && <IconKebab isPassed={index < stageNum} />}
          </div>
        ))}
      </div>
    </section>
  );
}
