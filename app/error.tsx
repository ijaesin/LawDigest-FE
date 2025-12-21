'use client';

import BackHomeButtons from '@/app/common/components/PageActions/BackHomeButtons';
import { Layout } from '@/app/common/components/Layout/Layout';
import Image from 'next/image';

export default function Error({ error }: { error: Error }) {
  console.error(error);

  return (
    <Layout nav logo notification>
      <section className="flex flex-col justify-center items-center mt-20 h-full md:mt-28">
        <Image
          src="/images/500-error.svg"
          width={500}
          height={240}
          alt="500 에러 이미지"
          className="mb-[40px] w-[269px] md:w-[500px] h-[180px] md:h-[240px]"
        />
        <h2 className="text-2xl md:text-[45px] font-extralight mb-[18px] md:mb-[28px]">페이지가 작동하지 않습니다.</h2>
        <BackHomeButtons refresh />
      </section>
    </Layout>
  );
}
