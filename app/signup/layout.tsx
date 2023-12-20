import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 페이지',
  description: '회원가입 페이지',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full h-full flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  sm:w-[430px] md:h-[788px]">
      <section className="w-full h-full overflow-scroll gap-2 py-[10px]">{children}</section>
    </section>
  );
}
