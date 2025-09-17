'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { BIOMASS_TYPES } from '@/lib/types';
import type { BiomassType } from '@/lib/types';
import PlacesAutocomplete from './places-autocomplete';
import { Label } from './ui/label';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  biomassTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one type.',
  }),
  radiusKm: z.number().min(0.1).max(200),
  overlays: z.object({
    markers: z.boolean(),
    clusters: z.boolean(),
    heatmap: z.boolean(),
    cadastral: z.boolean(),
  }),
});

type FilterFormProps = {
    onSearch: () => void;
};

export default function FilterForm({ onSearch }: FilterFormProps) {
  const { t } = useTranslation();
  const {
    radiusKm,
    biomassTypes,
    overlays,
    isLoading,
    setRadiusKm,
    setBiomassTypes,
    setOverlays,
  } = useBiomassStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      biomassTypes,
      radiusKm,
      overlays,
    },
  });

  useEffect(() => {
    form.reset({ biomassTypes, radiusKm, overlays });
  }, [biomassTypes, radiusKm, overlays, form]);
  
  const { watch, handleSubmit } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'radiusKm' && value.radiusKm !== undefined) {
        setRadiusKm(value.radiusKm);
      }
      if (name === 'biomassTypes' && value.biomassTypes) {
        setBiomassTypes(value.biomassTypes as BiomassType[]);
      }
      if (name === 'overlays' && value.overlays) {
        setOverlays(value.overlays);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setRadiusKm, setBiomassTypes, setOverlays]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSearch)} className="space-y-6">
          <div className="space-y-2">
             <Label>{t('location')}</Label>
             <PlacesAutocomplete />
          </div>

          <FormField
            control={form.control}
            name="biomassTypes"
            render={() => (
              <FormItem>
                <div className="mb-4 flex items-center justify-between">
                  <FormLabel className="text-base">{t('biomass_types')}</FormLabel>
                </div>
                <div className="space-y-2">
                  {BIOMASS_TYPES.map((type) => (
                    <FormField
                      key={type}
                      control={form.control}
                      name="biomassTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, type]
                                  : field.value?.filter((value) => value !== type);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">{t(type as any)}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="radiusKm"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t('radius_km').replace('{radius}', value ? value.toFixed(1) : '0.0')}</FormLabel>
                <div className="flex items-center space-x-4">
                  <Slider
                    min={0.1}
                    max={200}
                    step={0.1}
                    value={value ? [value] : [0]}
                    onValueChange={(vals) => onChange(vals[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0.1}
                    max={200}
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
                name="overlays.clusters"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('cluster_markers')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overlays.heatmap"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('heatmap')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overlays.cadastral"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('cadastral_layer')}</FormLabel>
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
