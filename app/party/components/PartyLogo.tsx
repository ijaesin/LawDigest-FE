import Image from 'next/image';

export default function PartyLogo({ party_name, party_img_url }: { party_name: string; party_img_url: string }) {
  return (
    <div className={`shadow-lg rounded-full w-[130px] h-[130px] flex justify-center items-center border ${party_name}`}>
      <Image
        className="dark:hidden w-[100px] h-[45px] object-contain"
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_img_url}`}
        width={200}
        height={90}
        alt={`${party_name} 로고 이미지`}
      />
      <Image
        className="hidden dark:block w-[100px] h-[45px] object-contain"
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_img_url.replace('wide', 'dark')}`}
        width={200}
        height={90}
        alt={`${party_name} 로고 이미지`}
      />
    </div>
  );
}
