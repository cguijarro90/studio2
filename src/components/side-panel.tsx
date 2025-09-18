'use client';

import FilterForm from './filter-form';
import ResultsList from './results-list';
import LanguageSwitcher from './language-switcher';
import ProvinceList from './province-list';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';
import { HelpCircle } from 'lucide-react';
import { useBiomassStore } from '@/store/biomass-store';

type SidePanelProps = {
  onSearch: () => void;
};

export default function SidePanel({ onSearch }: SidePanelProps) {
  const { t } = useTranslation();
  const { setIsInitialDialogOpen } = useBiomassStore();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">{t('app_title')}</h1>
                <p className="text-sm text-muted-foreground">{t('app_subtitle')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsInitialDialogOpen(true)}>
                <HelpCircle className="w-6 h-6 text-muted-foreground" />
                <span className="sr-only">{t('help')}</span>
            </Button>
        </div>
      </div>
      <div className="p-4">
        <FilterForm onSearch={onSearch} />
      </div>
      <Separator />
      <ScrollArea className="flex-1 min-h-0">
        <ProvinceList />
        <ResultsList />
      </ScrollArea>
      <Separator />
      <LanguageSwitcher />
    </div>
  );
}
