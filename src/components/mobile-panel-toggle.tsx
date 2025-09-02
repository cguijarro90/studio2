'use client';

import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export default function MobilePanelToggle(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-4 right-4 z-10 h-14 w-14 rounded-full shadow-lg md:hidden"
      {...props}
    >
      <SlidersHorizontal className="h-6 w-6" />
      <span className="sr-only">Open Filters & Results</span>
    </Button>
  );
}
