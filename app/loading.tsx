import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Loading() {
  return (
    <section className="flex flex-col items-center justify-center h-full mt-[140px] md:mt-[180px]">
      <Image
        src="/images/logo.svg"
        width={600}
        height={93}
        alt="로딩 이미지"
        className="mb-[18px] md:mb-[50px] w-[269px] md:w-[600px] h-[93px] md:h-[140px]"
      />
      <h2 className="text-2xl md:text-[45px] font-extralight mb-[18px] md:mb-[28px]">AI 기반 입법정보 제공 플랫폼</h2>
      <Loader2 className="h-10 w-10 animate-spin" />
    </section>
  );
}
