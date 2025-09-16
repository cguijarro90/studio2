'use client';

import { useBiomassStore } from '@/store/biomass-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import FilterForm from './filter-form';
import { useTranslation } from '@/hooks/use-translation';

type InitialFilterDialogProps = {
    onApply: () => void;
}

export default function InitialFilterDialog({ onApply }: InitialFilterDialogProps) {
  const { t } = useTranslation();
  const { isInitialDialogOpen, setIsInitialDialogOpen } = useBiomassStore();

  const handleApply = () => {
    onApply();
    setIsInitialDialogOpen(false);
  }

  return (
    <Dialog open={isInitialDialogOpen} onOpenChange={setIsInitialDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('initial_dialog_title')}</DialogTitle>
          <DialogDescription>
            {t('initial_dialog_desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FilterForm onSearch={handleApply} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
