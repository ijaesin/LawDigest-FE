export default function CongressmanDetailSkeleton() {
  return (
    <div className="xl:flex xl:items-start xl:justify-center xl:gap-10">
      {/* Profile card skeleton */}
      <div className="mx-5 md:mx-auto xl:mx-0 mt-5 py-4 px-7 border-1.5 flex flex-col items-center gap-5 mb-4 dark:bg-dark-b xl:h-min md:w-[430px] xl:w-[320px] shrink-0 shadow-md rounded-md">
        <div className="w-[64px] h-[30px] bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
        <div className="flex gap-5 justify-between w-full">
          <div className="w-[100px] h-[100px] rounded-full bg-gray-1 dark:bg-dark-l animate-pulse" />
          <div className="flex flex-col justify-between py-3 w-[65%] items-end gap-2">
            <div className="h-7 w-32 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-1 dark:bg-dark-l" />
        <div className="flex justify-between w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 basis-1/3">
              <div className="h-7 w-10 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="w-full h-12 bg-gray-1 dark:bg-dark-l rounded-full animate-pulse" />
      </div>
      {/* Bill list skeleton */}
      <div className="flex-1 max-w-[640px]">
        <div className="h-10 w-full bg-gray-1 dark:bg-dark-l rounded animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-gray-1 dark:bg-dark-l rounded animate-pulse mb-2" />
        ))}
      </div>
    </div>
  );
}
