import { SearchCongressmanPartyProps } from '@/types';
import { RefObject } from 'react';
import { Spinner } from '@nextui-org/spinner';
import SearchParty from './SearchParty';
import SearchCongressman from './SearchCongressman';

export default function SearchList({
  searchResults,
  isFetching,
  fetchRef,
}: {
  searchResults: SearchCongressmanPartyProps[];
  isFetching: boolean;
  fetchRef: RefObject<HTMLDivElement>;
}) {
  return (
    <section className="mx-5 my-8">
      <div className={`flex flex-col gap-5 ${searchResults.length ? 'lg:grid lg:grid-cols-2' : ''} lg:gap-y-5 `}>
        {searchResults.map((searchResult, index) =>
          searchResult.search_type === 'PARTY' ? (
            <SearchParty key={`${searchResult.party_id + index}`} {...searchResult} />
          ) : (
            <SearchCongressman key={`${searchResult.congressman_id + index}`} {...searchResult} />
          ),
        )}
      </div>
      {isFetching && (
        <div className="flex justify-center w-full my-4">
          <Spinner color="default" />
        </div>
      )}
      <div ref={fetchRef} />
    </section>
  );
}
