import { Header } from '../Header';
import { Nav } from '../Nav';

interface LayoutProps {
  logo?: boolean;
  goBack?: boolean;
  title?: string;
  setting?: boolean;
  search?: boolean;
  notification?: boolean;
  nav?: boolean;
  theme?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  logo,
  goBack,
  title,
  setting,
  search,
  nav,
  notification,
  theme,
  children,
}: LayoutProps) {
  return (
    <section className="w-full h-full flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  sm:w-[430px] lg:w-full min-w-[360px]">
      <Header
        logo={logo}
        goBack={goBack}
        title={title}
        setting={setting}
        search={search}
        notification={notification}
        theme={theme}
      />
      <section className="w-full h-[calc(100%-64px)] overflow-scroll max-w-[1280px]">{children}</section>
      {nav && <Nav />}
    </section>
  );
}
