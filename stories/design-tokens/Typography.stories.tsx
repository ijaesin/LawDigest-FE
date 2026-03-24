import type { Meta, StoryObj } from '@storybook/react';

function TypographyPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs">display (28/32px, 700)</p>
        <h1 className="text-[28px] font-bold leading-[1.2] md:text-[32px]">페이지 타이틀</h1>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">heading-lg (22/24px, 600)</p>
        <h2 className="text-[22px] font-semibold leading-[1.3] md:text-[24px]">섹션 제목</h2>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">heading-sm (18/20px, 600)</p>
        <h3 className="text-[18px] font-semibold leading-[1.3] md:text-[20px]">카드 제목, 법안명</h3>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">body (15/16px, 400)</p>
        <p className="text-[15px] leading-[1.6] md:text-base">
          본문 텍스트입니다. AI가 요약한 법안 내용이 여기에 표시됩니다.
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">caption (13px, 400)</p>
        <p className="text-muted-foreground text-[13px] leading-[1.4]">메타데이터, 2025.03.23</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">micro (11px, 500)</p>
        <p className="text-[11px] font-medium leading-[1.3]">배지 텍스트</p>
      </div>
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Typography' };
export default meta;
export const TypeScale: StoryObj = { render: () => <TypographyPage /> };
