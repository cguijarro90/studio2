'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BIOMASS_TECHNOLOGIES } from "@/lib/types";
import { getColoredBiomassIcon } from "./icons";
import { Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { BiomassType } from "@/lib/types";
import { useBiomassStore } from "@/store/biomass-store";

export default function MapLegend() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const { overlays } = useBiomassStore();

  const getTechnologyTranslationKey = (tech: string): BiomassType => {
      const lowerTech = tech.toLowerCase();
      if (lowerTech.includes('biomasa')) return 'biomass';
      if (lowerTech.includes('cogeneración')) return 'cogeneration';
      if (lowerTech.includes('residuos')) return 'waste';
      return 'otros';
  }

  if (!overlays.biomassPlants) {
    return null;
  }

  return (
    <Card className="w-auto bg-card/80 backdrop-blur-sm transition-all">
      <CardHeader className="flex-row items-center space-y-0 p-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Layers className="h-5 w-5 mr-2 text-primary" />
        <CardTitle className="text-base">{t('legend')}</CardTitle>
      </CardHeader>
      <CardContent className={cn("p-3 pt-0 space-y-2 transition-all duration-300 ease-in-out overflow-hidden", isOpen ? "max-h-96 opacity-100" : "max-h-0 p-0 opacity-0")}>
        {BIOMASS_TECHNOLOGIES.map((type) => (
          <div key={type} className="flex items-center text-sm">
            {getColoredBiomassIcon(type, "mr-2 h-5 w-5")}
            <span className="capitalize">{t(getTechnologyTranslationKey(type))}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
