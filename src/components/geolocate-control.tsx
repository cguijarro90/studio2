'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Button } from './ui/button';
import { Icons } from './icons';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export default function GeolocateControl() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const map = useMap();
  const { setCenter, setSearchInitiated } = useBiomassStore();

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('geolocation_not_supported' as any),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newCenter);
        setSearchInitiated(true);
        if (map) {
          map.panTo(newCenter);
          map.setZoom(10);
        }
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: t('geolocation_denied' as any),
        });
      }
    );
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleGeolocate}
      title={t('geolocate_me' as any)}
    >
      <Icons.crosshair className="h-5 w-5" />
      <span className="sr-only">{t('geolocate_me' as any)}</span>
    </Button>
  );
}
