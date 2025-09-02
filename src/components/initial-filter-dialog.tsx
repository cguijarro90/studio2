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

export default function InitialFilterDialog() {
  const { isInitialDialogOpen, setIsInitialDialogOpen } = useBiomassStore();

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
          <FilterForm />
        </div>
        <DialogFooter>
          <Button onClick={() => setIsInitialDialogOpen(false)}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
