"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isInsideDesktopApp, setIsInsideDesktopApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).isUpScaleApp) {
      setIsInsideDesktopApp(true);
    }
  }, []);

  const shouldHideUI = isInsideDesktopApp || pathname?.startsWith('/learning');

  return (
    <>
      {!shouldHideUI && <Navbar />}
      <main className={shouldHideUI ? "" : "pt-28"}>
        {children}
      </main>

      {!shouldHideUI && <Footer />}
    </>
  );
}