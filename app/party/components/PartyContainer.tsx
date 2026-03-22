'use client';

import PartyDetail from './PartyDetail';
import PartyCongressmanList from './PartyCongressmanList';
import BillContainer from './BillContainer';

export default function PartyContainer({ partyId }: { partyId: number }) {
  return (
    <div className="xl:flex xl:justify-center xl:gap-10">
      <div>
        <PartyDetail partyId={partyId} />
        <PartyCongressmanList partyId={partyId} />
      </div>
      <div className="">
        <BillContainer id={partyId} />
      </div>
    </div>
  );
}
