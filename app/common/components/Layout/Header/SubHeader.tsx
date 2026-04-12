import { GoBackButton } from '@/app/common/components';

export default function SubHeader({ title }: { title: string }) {
  return (
    <section className="hidden relative items-center pb-3 mt-5 font-medium lg:flex border-b-1 dark:border-dark-l">
      <div className="absolute">
        <GoBackButton />
      </div>
      <div className="mx-auto">{title}</div>
    </section>
  );
}
