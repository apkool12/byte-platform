'use client';

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}



