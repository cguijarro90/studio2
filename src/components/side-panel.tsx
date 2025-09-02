'use client';

import FilterForm from './filter-form';
import ResultsList from './results-list';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

type SidePanelProps = {
  onSearch: () => void;
};

export default function SidePanel({ onSearch }: SidePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline text-primary">Biomass Mapper</h1>
        <p className="text-sm text-muted-foreground">Find biomass sources near you.</p>
      </div>
      <div className="p-4">
        <FilterForm onSearch={onSearch} />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <ResultsList />
      </ScrollArea>
    </div>
  );
}
