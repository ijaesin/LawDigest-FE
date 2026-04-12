'use client';

import Image from 'next/image';
import BackHomeButtons from '@/app/common/components/PageActions/BackHomeButtons';

export default function NotFound() {
  return (
    <section className="flex flex-col justify-center items-center mt-20 w-full h-full md:mt-28">
      <Image
        src="/images/404-error.svg"
        width={500}
        height={240}
        alt="404 에러 이미지"
        className="mb-[40px] w-[269px] md:w-[500px] h-[180px] md:h-[240px]"
      />
      <h2 className="text-2xl md:text-[45px] font-extralight mb-[18px] md:mb-[28px]">페이지를 찾을 수 없습니다.</h2>
      <BackHomeButtons />
    </section>
  );
}
