
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

interface CropAnalysis {
    name: string;
    totalArea: number;
    plotCount: number;
}

export default function AgriculturalAnalysisDialog() {
  const { t, locale } = useTranslation();
  const { isAgriculturalAnalysisOpen, setIsAgriculturalAnalysisOpen, agriculturalPlots } = useBiomassStore();

  const analysisData: CropAnalysis[] = useMemo(() => {
    if (!agriculturalPlots || agriculturalPlots.length === 0) {
      return [];
    }

    const cropMap = new Map<string, { totalArea: number; plotCount: number }>();

    agriculturalPlots.forEach(plot => {
      if (plot.cropType && plot.area_ha) {
        const current = cropMap.get(plot.cropType) || { totalArea: 0, plotCount: 0 };
        current.totalArea += plot.area_ha;
        current.plotCount += 1;
        cropMap.set(plot.cropType, current);
      }
    });

    const sortedCrops = [...cropMap.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalArea - a.totalArea);

    return sortedCrops.slice(0, 10);
  }, [agriculturalPlots]);

  return (
    <Dialog open={isAgriculturalAnalysisOpen} onOpenChange={setIsAgriculturalAnalysisOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <div className="flex items-center gap-2">
                <Icons.barChart className="h-6 w-6 text-primary" />
                <DialogTitle className="text-xl font-bold">
                    {t('agricultural_analysis_title' as any)}
                </DialogTitle>
            </div>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('crop_type' as any)}</TableHead>
                        <TableHead className="text-right">{t('total_area_ha' as any)}</TableHead>
                        <TableHead className="text-right">{t('plot_count' as any)}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analysisData.map(crop => (
                            <TableRow key={crop.name}>
                                <TableCell className="font-medium capitalize">{crop.name.toLowerCase()}</TableCell>
                                <TableCell className="text-right">{crop.totalArea.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right">{crop.plotCount.toLocaleString('es-ES')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
        <DialogFooter>
            <Button onClick={() => setIsAgriculturalAnalysisOpen(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
