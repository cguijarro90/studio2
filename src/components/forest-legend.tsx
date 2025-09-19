
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "./icons";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useBiomassStore } from "@/store/biomass-store";
import { ScrollArea } from "./ui/scroll-area";

export default function ForestLegend() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const { overlays, forestSpeciesColors, forestPlots } = useBiomassStore();

  const species = Object.keys(forestSpeciesColors);

  if (!overlays.forestData || forestPlots.length === 0 || species.length === 0) {
    return null;
  }

  return (
    <Card className="w-auto max-w-[200px] bg-card/80 backdrop-blur-sm transition-all">
      <CardHeader className="flex-row items-center space-y-0 p-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Icons.trees className="h-5 w-5 mr-2 text-primary" />
        <CardTitle className="text-base">{t('forest_legend_title' as any)}</CardTitle>
      </CardHeader>
      <CardContent className={cn("p-0 transition-all duration-300 ease-in-out overflow-hidden", isOpen ? "max-h-60 opacity-100" : "max-h-0 p-0 opacity-0")}>
        <ScrollArea className={cn("h-full", isOpen ? "h-60" : "h-0")}>
            <div className="p-3 pt-0 space-y-2">
            {species.sort().map((type) => (
                <div key={type} className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-sm mr-2 shrink-0" style={{ backgroundColor: forestSpeciesColors[type] }} />
                    <span className="capitalize truncate">{type}</span>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
