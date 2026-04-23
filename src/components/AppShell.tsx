'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Navigation from './Navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    return <main style={{ height: '100%', overflow: 'hidden' }}>{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="content-area">
        {children}
      </main>
      <Navigation />
    </>
  );
}
