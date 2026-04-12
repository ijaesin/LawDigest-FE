import type { ReactNode } from 'react';

function parseBoldMarkdown(text: string): ReactNode[] {
  return text
    .split('**')
    .map((segment) => (segment.length % 2 === 0 ? segment : <strong key={segment}>{segment}</strong>));
}

export default function BillSummaryContent({
  gptSummary,
  summary,
  isCollapsed,
}: {
  gptSummary: string;
  summary: string;
  isCollapsed: boolean;
}) {
  const clampClass = isCollapsed ? 'line-clamp-[8]' : '';

  return <p className={clampClass}>{gptSummary ? parseBoldMarkdown(gptSummary) : summary}</p>;
}
