import { GlassCard, GlassAvatar } from '@/app/common/components/atoms';
import { VoteBar } from '@/app/common/components/molecules';
import type { z } from 'zod';
import type { PartyVoteSchema } from '@/app/bill/validation/bill.schema';

type PartyVote = z.infer<typeof PartyVoteSchema>;

export interface VoteResultGridProps {
  approvalCount: number;
  totalVoteCount: number;
  partyVoteList: PartyVote[];
  billResult?: string;
}

export function VoteResultGrid({ approvalCount, totalVoteCount, partyVoteList, billResult }: VoteResultGridProps) {
  return (
    <GlassCard level="medium">
      <h2 className="text-lg font-semibold text-foreground">표결 결과</h2>

      {billResult && <p className="mt-1 text-sm text-muted-foreground">{billResult}</p>}

      <div className="mt-4">
        <VoteBar approvalCount={approvalCount} totalCount={totalVoteCount} showLabel />
      </div>

      {partyVoteList.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {partyVoteList.map((pv) => (
            <div key={pv.party_info.party_id} className="flex flex-col items-center gap-2 text-center">
              <GlassAvatar
                size="md"
                src={pv.party_info.party_image_url || undefined}
                fallback={pv.party_info.party_name[0]}
                partyName={pv.party_info.party_name}
              />
              <span className="text-sm font-medium text-foreground">{pv.party_info.party_name}</span>
              <span className="text-xs text-muted-foreground">{pv.party_approval_count}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
