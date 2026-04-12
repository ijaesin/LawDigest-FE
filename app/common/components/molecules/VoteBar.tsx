export interface VoteBarProps {
  approvalCount: number;
  totalCount: number;
  showLabel?: boolean;
}

export function VoteBar({ approvalCount, totalCount, showLabel = false }: VoteBarProps) {
  const ratio = totalCount > 0 ? (approvalCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-[var(--duration-normal)]"
          style={{ width: `${ratio}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {approvalCount}/{totalCount} ({Math.round(ratio)}%)
        </span>
      )}
    </div>
  );
}
