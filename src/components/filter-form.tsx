'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import PlacesAutocomplete from './places-autocomplete';
import { Label } from './ui/label';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  radiusKm: z.number().min(0.1).max(75),
  overlays: z.object({
    biomassPlants: z.boolean(),
    agriculturalData: z.boolean(),
    forestData: z.boolean(),
  }),
});

type FilterFormProps = {
    onSearch: () => void;
};

export default function FilterForm({ onSearch }: FilterFormProps) {
  const { t } = useTranslation();
  const {
    center,
    radiusKm,
    overlays,
    isLoading,
    setRadiusKm,
    setOverlays,
  } = useBiomassStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      radiusKm,
      overlays,
    },
  });

  useEffect(() => {
    form.reset({ radiusKm, overlays });
  }, [radiusKm, overlays, form]);
  
  const { watch, handleSubmit } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'radiusKm' && value.radiusKm !== undefined) {
        setRadiusKm(value.radiusKm);
      }
      if (name === 'overlays' && value.overlays) {
        setOverlays(value.overlays);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setRadiusKm, setOverlays]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSearch)} className="space-y-6">
          <div className="space-y-2">
             <Label>{t('location')}</Label>
             <PlacesAutocomplete />
             {center && (
                <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    <span>{t('latitude')}: {center.lat.toFixed(6)}</span>
                    <span>{t('longitude')}: {center.lng.toFixed(6)}</span>
                </div>
             )}
          </div>

          <FormField
            control={form.control}
            name="radiusKm"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t('radius_km').replace('{radius}', value ? value.toFixed(1) : '0.0')}</FormLabel>
                <div className="flex items-center space-x-4">
                  <Slider
                    min={0.1}
                    max={75}
                    step={0.1}
                    value={value ? [value] : [0]}
                    onValueChange={(vals) => onChange(vals[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0.1}
                    max={75}
                    step={0.1}
                    value={value || 0}
                    onChange={(e) => onChange(e.target.valueAsNumber)}
                    className="w-24"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>{t('map_layers')}</FormLabel>
             <FormField
                control={form.control}
                name="overlays.biomassPlants"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('biomass_plants')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overlays.agriculturalData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('agricultural_data')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overlays.forestData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('forest_data')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('searching') : t('search')}
          </Button>

        </form>
      </Form>
    </>
  );
}
