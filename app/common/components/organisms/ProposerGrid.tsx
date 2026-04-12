'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard, GlassButton } from '@/app/common/components/atoms';
import { ProposerAvatar } from '@/app/common/components/molecules';
import type { z } from 'zod';
import type { RepresentativeProposerSchema, PublicProposerSchema } from '@/app/bill/validation/bill.schema';

type RepresentativeProposer = z.infer<typeof RepresentativeProposerSchema>;
type PublicProposer = z.infer<typeof PublicProposerSchema>;

export interface ProposerGridProps {
  representativeProposers: RepresentativeProposer[];
  publicProposers: PublicProposer[];
}

const INITIAL_PUBLIC_COUNT = 6;

export function ProposerGrid({ representativeProposers, publicProposers }: ProposerGridProps) {
  const [expanded, setExpanded] = useState(false);
  const visiblePublic = expanded ? publicProposers : publicProposers.slice(0, INITIAL_PUBLIC_COUNT);

  return (
    <GlassCard level="medium">
      {/* Representative proposers */}
      {representativeProposers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground">대표발의자</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {representativeProposers.map((p) => (
              <ProposerAvatar
                key={p.representative_proposer_id}
                name={p.representative_proposer_name}
                imageUrl={p.represent_proposer_img_url}
                partyName={p.party_name}
                congressmanId={p.representative_proposer_id}
                size="md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Public proposers */}
      {publicProposers.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-foreground">공동발의자 {publicProposers.length}명</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {visiblePublic.map((p) => (
              <ProposerAvatar
                key={p.public_proposer_id}
                name={p.public_proposer_name}
                imageUrl={p.public_proposer_img_url}
                partyName={p.public_proposer_party_name}
                size="sm"
              />
            ))}
          </div>
          {publicProposers.length > INITIAL_PUBLIC_COUNT && (
            <div className="mt-3 flex justify-center">
              <GlassButton variant="ghost" size="sm" onClick={() => setExpanded((prev) => !prev)}>
                {expanded ? (
                  <>
                    접기 <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    더보기 <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </GlassButton>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
