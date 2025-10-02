'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export default function LiteVersionRibbon() {
  const { isLiteVersion } = useBiomassStore();
  const { t } = useTranslation();

  if (!isLiteVersion) {
    return null;
  }

  return (
    <div className={cn(
      "absolute top-4 left-1/2 -translate-x-1/2 z-10",
      "h-8 flex items-center justify-center",
      "bg-primary text-primary-foreground",
      "px-4 shadow-lg rounded-md"
    )}>
      <div className={cn(
        "text-center text-sm font-bold",
      )}>
        {t('lite_version' as any)}
      </div>
    </div>
  );
}
