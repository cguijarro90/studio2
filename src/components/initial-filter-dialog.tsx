'use client';

import { useBiomassStore } from '@/store/biomass-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';

export default function InitialFilterDialog() {
  const { t } = useTranslation();
  const { isInitialDialogOpen, setIsInitialDialogOpen } = useBiomassStore();

  return (
    <Dialog open={isInitialDialogOpen} onOpenChange={setIsInitialDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            {t('app_title')}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            By Kynegos
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm text-muted-foreground">
          <p>
            {t('help_desc_p1')}
          </p>
          <p>
            {t('help_desc_p2')}
          </p>
        </div>
        <DialogFooter>
            <Button onClick={() => setIsInitialDialogOpen(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
