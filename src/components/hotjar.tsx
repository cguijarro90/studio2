'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const Hotjar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
    if (!hotjarId) {
      console.warn('Hotjar ID not configured');
      return;
    }

    if (typeof window !== 'undefined' && !(window as any).hj) {
      (function(h:any,o:any,t:any,j:any,a?:any,r?:any){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:parseInt(hotjarId),hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    }
  }, []);

  useEffect(() => {
    const relativePath = pathname + '?' + searchParams.toString();
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('path', relativePath);
    }
  }, [pathname, searchParams]);

  return null;
};

export default Hotjar;
