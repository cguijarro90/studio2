'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from './ui/card';

export default function CoordinatesDisplay() {
  const { t } = useTranslation();
  const { center } = useBiomassStore();

  if (!center) {
    return null;
  }

  return (
    <Card className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-sm p-2 text-xs text-foreground">
      <div>
        <span className="font-semibold">{t('latitude' as any)}:</span> {center.lat.toFixed(6)}
      </div>
      <div>
        <span className="font-semibold">{t('longitude' as any)}:</span> {center.lng.toFixed(6)}
      </div>
    </Card>
  );
}
