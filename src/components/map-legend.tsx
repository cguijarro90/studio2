'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BIOMASS_TYPES } from "@/lib/types";
import { getColoredBiomassIcon } from "./icons";
import { Layers } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(true);

  const getBiomassLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className="absolute bottom-4 left-4 w-auto bg-card/80 backdrop-blur-sm transition-all">
      <CardHeader className="flex-row items-center space-y-0 p-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Layers className="h-5 w-5 mr-2 text-primary" />
        <CardTitle className="text-base">Legend</CardTitle>
      </CardHeader>
      <CardContent className={cn("p-3 pt-0 space-y-2 transition-all duration-300 ease-in-out overflow-hidden", isOpen ? "max-h-96 opacity-100" : "max-h-0 p-0 opacity-0")}>
        {BIOMASS_TYPES.map((type) => (
          <div key={type} className="flex items-center text-sm">
            {getColoredBiomassIcon(type, "mr-2 h-5 w-5")}
            <span>{getBiomassLabel(type)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
