
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
import { Icons } from './icons';

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
    radiusKm,
    overlays,
    isLoading,
    forestPlots,
    agriculturalPlots,
    setRadiusKm,
    setOverlays,
    setIsForestAnalysisOpen,
    setIsAgriculturalAnalysisOpen,
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
  
  const { watch, handleSubmit, getValues } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'radiusKm' && value.radiusKm !== undefined) {
        setRadiusKm(value.radiusKm);
      }
      // Overlays are handled by onCheckedChange now
    });
    return () => subscription.unsubscribe();
  }, [watch, setRadiusKm, setOverlays]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSearch)} className="space-y-6">
          <div>
             <Label className="text-muted-foreground font-bold">{t('location')}</Label>
             <PlacesAutocomplete />
          </div>

          <FormField
            control={form.control}
            name="radiusKm"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormLabel className="text-muted-foreground font-bold text-sm whitespace-nowrap">{t('radius' as any)}</FormLabel>
                  <Slider
                    min={0.1}
                    max={75}
                    step={0.1}
                    value={value ? [value] : [0]}
                    onValueChange={(vals) => onChange(vals[0])}
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-1">
                    <Input
                      type="number"
                      min={0.1}
                      max={75}
                      step={0.1}
                      value={value ? parseFloat(value.toFixed(1)) : 0}
                      onChange={(e) => onChange(e.target.valueAsNumber)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">km</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel className="text-muted-foreground font-bold">{t('map_layers')}</FormLabel>
             <FormField
                control={form.control}
                name="overlays.biomassPlants"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm text-muted-foreground">{t('biomass_plants')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setOverlays({ ...getValues().overlays, biomassPlants: checked });
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overlays.agriculturalData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm text-muted-foreground">
                        {t('agricultural_data')}
                        {agriculturalPlots.length > 0 && ` (${agriculturalPlots.length})`}
                        </FormLabel>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={!agriculturalPlots || agriculturalPlots.length === 0}
                            onClick={() => setIsAgriculturalAnalysisOpen(true)}
                        >
                            <Icons.barChart className="h-4 w-4" />
                            <span className="sr-only">{t('show_analysis' as any)}</span>
                        </Button>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setOverlays({ ...getValues().overlays, agriculturalData: checked });
                            }}
                          />
                        </FormControl>
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overlays.forestData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm text-muted-foreground">
                        {t('forest_data')}
                        {forestPlots.length > 0 && ` (${forestPlots.length})`}
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={!forestPlots || forestPlots.length === 0}
                            onClick={() => setIsForestAnalysisOpen(true)}
                        >
                            <Icons.barChart className="h-4 w-4" />
                            <span className="sr-only">{t('show_analysis' as any)}</span>
                        </Button>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setOverlays({ ...getValues().overlays, forestData: checked });
                            }}
                        />
                        </FormControl>
                    </div>
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
