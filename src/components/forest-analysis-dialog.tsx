
'use client';

import { useMemo } from 'react';
import { useBiomassStore } from '@/store/biomass-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from './ui/scroll-area';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';
import { Icons } from './icons';

interface SpeciesAnalysis {
    name: string;
    totalArea: number;
    plotCount: number;
}

export default function ForestAnalysisDialog() {
  const { t, locale } = useTranslation();
  const { isForestAnalysisOpen, setIsForestAnalysisOpen, forestPlots } = useBiomassStore();

  const analysisData: SpeciesAnalysis[] = useMemo(() => {
    if (!forestPlots || forestPlots.length === 0) {
      return [];
    }

    const speciesMap = new Map<string, { totalArea: number; plotCount: number }>();

    forestPlots.forEach(plot => {
      if (plot.mainSpecies && plot.area_ha) {
        const current = speciesMap.get(plot.mainSpecies) || { totalArea: 0, plotCount: 0 };
        current.totalArea += plot.area_ha;
        current.plotCount += 1;
        speciesMap.set(plot.mainSpecies, current);
      }
    });

    const sortedSpecies = [...speciesMap.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalArea - a.totalArea);

    return sortedSpecies.slice(0, 10);
  }, [forestPlots]);

  return (
    <Dialog open={isForestAnalysisOpen} onOpenChange={setIsForestAnalysisOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <div className="flex items-center gap-2">
                <Icons.barChart className="h-6 w-6 text-primary" />
                <DialogTitle className="text-xl font-bold">
                    {t('forest_analysis_title' as any)}
                </DialogTitle>
            </div>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('species' as any)}</TableHead>
                        <TableHead className="text-right">{t('total_area_ha' as any)}</TableHead>
                        <TableHead className="text-right">{t('plot_count' as any)}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analysisData.map(species => (
                            <TableRow key={species.name}>
                                <TableCell className="font-medium capitalize">{species.name.toLowerCase()}</TableCell>
                                <TableCell className="text-right">{species.totalArea.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right">{species.plotCount.toLocaleString('es-ES')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
        <DialogFooter>
            <Button onClick={() => setIsForestAnalysisOpen(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
