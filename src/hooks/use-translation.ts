
'use client';

import { useBiomassStore } from '@/store/biomass-store';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

const translations = { es, en };

type TranslationKey = keyof typeof es | keyof typeof en;

export function useTranslation() {
  const { locale } = useBiomassStore();

  const t = (key: TranslationKey) => {
    return translations[locale][key as keyof typeof translations[typeof locale]] || key;
  };

  return { t, locale };
}
