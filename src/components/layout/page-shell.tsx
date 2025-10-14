import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-black text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
