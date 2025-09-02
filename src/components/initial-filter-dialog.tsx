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
import { Button } from '@/components/ui/button';
import FilterForm from './filter-form';

type InitialFilterDialogProps = {
    onApply: () => void;
}

export default function InitialFilterDialog({ onApply }: InitialFilterDialogProps) {
  const { isInitialDialogOpen, setIsInitialDialogOpen } = useBiomassStore();

  const handleApply = () => {
    onApply();
    setIsInitialDialogOpen(false);
  }

  return (
    <Dialog open={isInitialDialogOpen} onOpenChange={setIsInitialDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Your Search Area</DialogTitle>
          <DialogDescription>
            You can adjust the filters to find biomass sources. Click anywhere on the map to change your search center.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FilterForm onSearch={handleApply} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
