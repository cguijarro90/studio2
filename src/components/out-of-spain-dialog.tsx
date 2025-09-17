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
import { TriangleAlert } from 'lucide-react';

export default function OutOfSpainDialog() {
  const { t } = useTranslation();
  const { isOutOfSpainDialogOpen, setIsOutOfSpainDialogOpen } = useBiomassStore();

  return (
    <Dialog open={isOutOfSpainDialogOpen} onOpenChange={setIsOutOfSpainDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <TriangleAlert className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            {t('out_of_spain_title')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-center text-muted-foreground">
          <p>{t('out_of_spain_desc')}</p>
        </div>
        <DialogFooter>
            <Button onClick={() => setIsOutOfSpainDialogOpen(false)} className="w-full">{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
