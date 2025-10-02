
'use client';

import { useBiomassStore } from '@/store/biomass-store';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

const translations = { es, en };

type TranslationKey = keyof typeof es | keyof typeof en;

export function useTranslation() {
  const { locale } = useBiomassStore();

  const t = (key: TranslationKey, replacements?: Record<string, string | number>) => {
    let translation = translations[locale][key as keyof typeof translations[typeof locale]] || key;

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return translation;
  };

  return { t, locale };
}
