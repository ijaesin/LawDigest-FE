import Image from 'next/image';

interface LogoProps {
  width: number;
  height: number;
}

export default function Logo({ width, height }: LogoProps) {
  return (
    <>
      <Image className="dark:hidden" src="/images/logo.svg" width={width} height={height} alt="로고이미지" />
      <Image className="hidden dark:block" src="/images/logoDark.svg" width={width} height={height} alt="로고이미지" />
    </>
  );
}
