'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { BIOMASS_TYPES } from '@/lib/types';
import type { BiomassType } from '@/lib/types';
import { Icons } from './icons';
import PlacesAutocomplete from './places-autocomplete';
import AiSuggestionDialog from './ai-suggestion-dialog';
import { Label } from './ui/label';

const formSchema = z.object({
  biomassTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one type.',
  }),
  radiusKm: z.number().min(0.1).max(200),
  overlays: z.object({
    markers: z.boolean(),
    clusters: z.boolean(),
    heatmap: z.boolean(),
  }),
});

export default function FilterForm() {
  const {
    radiusKm,
    biomassTypes,
    overlays,
    setRadiusKm,
    setBiomassTypes,
    setOverlays,
  } = useBiomassStore();

  const [showAiDialog, setShowAiDialog] = useState(false);

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

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'radiusKm' && value.radiusKm) {
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
        <form className="space-y-6">
          <div className="space-y-2">
             <Label>Location</Label>
             <PlacesAutocomplete />
          </div>

          <FormField
            control={form.control}
            name="biomassTypes"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Biomass Types</FormLabel>
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
                                return checked
                                  ? field.onChange([...field.value, type])
                                  : field.onChange(field.value?.filter((value) => value !== type));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">{type}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="button" variant="outline" size="sm" onClick={() => setShowAiDialog(true)}>
            <Icons.ai className="mr-2 h-4 w-4" />
            Suggest New Types
          </Button>


          <FormField
            control={form.control}
            name="radiusKm"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Radius ({value.toFixed(1)} km)</FormLabel>
                <div className="flex items-center space-x-4">
                  <Slider
                    min={0.1}
                    max={200}
                    step={0.1}
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0.1}
                    max={200}
                    step={0.1}
                    value={value}
                    onChange={(e) => onChange(e.target.valueAsNumber)}
                    className="w-24"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Map Layers</FormLabel>
             <FormField
                control={form.control}
                name="overlays.clusters"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Cluster Markers</FormLabel>
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
                      <FormLabel>Heatmap</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
          </div>
        </form>
      </Form>
      <AiSuggestionDialog open={showAiDialog} onOpenChange={setShowAiDialog} />
    </>
  );
}
