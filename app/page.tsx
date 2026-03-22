import { Layout } from '@/app/common/components/Layout/Layout';
import ClientHomeSection from './ClientHomeSection';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Layout nav logo notification>
      <ClientHomeSection />
    </Layout>
  );
}
