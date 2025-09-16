
'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useBiomassStore();

  const switchLanguage = (lang: Locale) => {
    setLocale(lang);
  };

  return (
    <div className="flex items-center justify-center gap-1 p-4">
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
  );
}
