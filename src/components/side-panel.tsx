'use client';

import FilterForm from './filter-form';
import ResultsList from './results-list';
import LanguageSwitcher from './language-switcher';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useTranslation } from '@/hooks/use-translation';

type SidePanelProps = {
  onSearch: () => void;
};

export default function SidePanel({ onSearch }: SidePanelProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline text-primary">{t('app_title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app_subtitle')}</p>
      </div>
      <div className="p-4">
        <FilterForm onSearch={onSearch} />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <ResultsList />
      </ScrollArea>
      <Separator />
      <LanguageSwitcher />
    </div>
  );
}
