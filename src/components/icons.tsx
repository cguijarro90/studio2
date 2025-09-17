import type { LucideProps } from 'lucide-react';
import { Leaf, MapPin, Layers, Weight, Milestone, Route, X, Flame, Circle, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Icons = {
  leaf: (props: LucideProps) => <Leaf {...props} />,
  pin: (props: LucideProps) => <MapPin {...props} />,
  layers: (props: LucideProps) => <Layers {...props} />,
  weight: (props: LucideProps) => <Weight {...props} />,
  distance: (props: LucideProps) => <Route {...props} />,
  radius: (props: LucideProps) => <Milestone {...props} />,
  close: (props: LucideProps) => <X {...props} />,
  flame: (props: LucideProps) => <Flame {...props} />,
  circle: (props: LucideProps) => <Circle {...props} />,
  crosshair: (props: LucideProps) => <Crosshair {...props} />,
  kynegosLogo: (props: Luc.LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      fill="currentColor"
    >
      <path d="M493.45,95.34,312.39,3.61a34.3,34.3,0,0,0-34.78,0L96.55,95.34a34.3,34.3,0,0,0-17.39,29.7V375a34.3,34.3,0,0,0,17.39,29.7L277.61,496.39a34.3,34.3,0,0,0,34.78,0L493.45,404.66a34.3,34.3,0,0,0,17.39-29.7V125A34.3,34.3,0,0,0,493.45,95.34ZM295,435.11,148.68,358.49,295,281.88ZM295,250.5,148.68,173.88,295,97.27ZM326.39,281.88,472.7,358.49,326.39,435.11ZM326.39,97.27,472.7,173.88,326.39,250.5Z" />
      <polygon points="6.55 133.34 6.55 366.66 232.39 499.61 232.39 408.28 75.83 328.61 75.83 171.39 232.39 91.72 232.39 0.39 6.55 133.34" />
    </svg>
  ),
};

// Returns uncolored icon for map pins
export function getBiomassIcon(type: string, className?: string) {
    const props = { className: cn("w-4 h-4", className) };
    switch(type) {
        case 'pellets':
            return <Icons.circle {...props} />;
        case 'carbon':
            return <Icons.flame {...props} />;
        case 'otros':
        default:
            return <Icons.leaf {...props} />;
    }
}

// Returns colored icon for UI elements like lists and legends
export function getColoredBiomassIcon(type: string, className?: string) {
    const props = { className: cn("w-4 h-4", className) };
    switch(type) {
        case 'pellets':
            return <Icons.circle {...props} className={cn(props.className, "text-chart-1")} />;
        case 'carbon':
            return <Icons.flame {...props} className={cn(props.className, "text-chart-2")} />;
        case 'otros':
        default:
            return <Icons.leaf {...props} className={cn(props.className, "text-chart-3")} />;
    }
}
