
'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useBiomassStore();

  const switchLanguage = (lang: Locale) => {
    setLocale(lang);
  };

  return (
    <div className="flex items-center justify-between gap-1 p-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => switchLanguage('es')}
          className={cn('p-1 h-6 w-8 rounded-sm', locale === 'es' && 'ring-2 ring-primary')}
        >
          <img src="https://flagcdn.com/es.svg" alt="Español" className="w-full h-full object-cover rounded-sm"/>
          <span className="sr-only">Español</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => switchLanguage('en')}
          className={cn('p-1 h-6 w-8 rounded-sm', locale === 'en' && 'ring-2 ring-primary')}
        >
          <img src="https://flagcdn.com/gb.svg" alt="English" className="w-full h-full object-cover rounded-sm" />
          <span className="sr-only">English</span>
        </Button>
      </div>
      <div>
        <a href="https://kynegos.com/" target="_blank" rel="noopener noreferrer">
          <Image src="/kynegos-logo.svg" alt="Kynegos Logo" width={100} height={29} />
        </a>
      </div>
    </div>
  );
}
