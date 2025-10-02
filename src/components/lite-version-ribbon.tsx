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
      "absolute top-14 left-0 z-10",
      "h-8 flex items-center justify-center",
      "bg-primary text-primary-foreground",
      "px-4 shadow-lg",
      "transform -translate-x-8 translate-y-8 -rotate-45"
    )}>
      <div className={cn(
        "w-40 text-center text-sm font-bold",
      )}>
        {t('lite_version' as any)}
      </div>
    </div>
  );
}
