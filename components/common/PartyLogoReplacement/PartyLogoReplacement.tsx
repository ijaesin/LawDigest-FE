export default function PartyLogoReplacement({ partyName, circle }: { partyName: string; circle: boolean }) {
  return circle ? (
    <div className="w-[54px] h-[54px] rounded-full border flex justify-center items-center overflow-hidden text-center text-[10px] font-semibold text-gray-3 dark:border-dark-l dark:bg-white">
      {partyName}
    </div>
  ) : (
    <div className="text-xl font-semibold text-center text-gray-3">{partyName}</div>
  );
}
