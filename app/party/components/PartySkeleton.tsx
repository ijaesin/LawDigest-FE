export default function PartySkeleton() {
  return (
    <div className="flex flex-col items-center mx-5 mt-5 gap-7 animate-pulse">
      <div className="w-[130px] h-[130px] rounded-full bg-muted dark:bg-border" />
      <div className="flex flex-col gap-2 items-center">
        <div className="w-32 h-6 bg-muted dark:bg-border rounded" />
        <div className="w-20 h-4 bg-muted dark:bg-border rounded" />
      </div>
      <div className="w-full h-px bg-muted dark:bg-border" />
      <div className="grid grid-cols-3 gap-10 w-full">
        {['follower', 'representative', 'public'].map((label) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-12 h-6 bg-muted dark:bg-border rounded" />
            <div className="w-16 h-4 bg-muted dark:bg-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
