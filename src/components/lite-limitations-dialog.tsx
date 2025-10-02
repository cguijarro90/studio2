
'use client';

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
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

export default function LiteLimitationsDialog() {
  const { t } = useTranslation();
  const { isLiteLimitationsDialogOpen, setIsLiteLimitationsDialogOpen, setIsContactFormOpen } = useBiomassStore();

  const handleContactClick = () => {
    setIsLiteLimitationsDialogOpen(false);
    setIsContactFormOpen(true);
  };

  const features = [
    {
      name: t('feature_radius' as any),
      lite: t('feature_radius_lite' as any),
      full: t('feature_radius_full' as any),
    },
    {
      name: t('feature_layers' as any),
      lite: t('feature_layers_lite' as any),
      full: t('feature_layers_full' as any),
    },
    {
      name: t('feature_data_access' as any),
      lite: <X className="h-5 w-5 text-destructive" />,
      full: <Check className="h-5 w-5 text-green-500" />,
    },
    {
      name: t('feature_analysis' as any),
      lite: <X className="h-5 w-5 text-destructive" />,
      full: <Check className="h-5 w-5 text-green-500" />,
    },
    {
      name: t('feature_plot_limit' as any),
      lite: t('feature_plot_limit_lite' as any),
      full: t('feature_plot_limit_full' as any),
    }
  ];

  return (
    <Dialog open={isLiteLimitationsDialogOpen} onOpenChange={setIsLiteLimitationsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('lite_vs_full_title' as any)}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t('feature' as any)}</TableHead>
                    <TableHead className="text-center">{t('lite_version' as any)}</TableHead>
                    <TableHead className="text-center">{t('full_version' as any)}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {features.map((feature) => (
                        <TableRow key={feature.name}>
                            <TableCell className="font-medium">{feature.name}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    {feature.lite}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    {feature.full}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsLiteLimitationsDialogOpen(false)} className="border-[#BFBFBF]">{t('close')}</Button>
            <Button onClick={handleContactClick}>{t('contact_sales' as any)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
