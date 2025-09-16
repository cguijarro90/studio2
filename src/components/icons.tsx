import type { LucideProps } from 'lucide-react';
import { Leaf, MapPin, Layers, Weight, Milestone, Route, X, Flame, Circle } from 'lucide-react';
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
            return <Icons.circle {...props} className={cn(props.className, "text-chart-1")} />; /* Kynegos Green */
        case 'carbon':
            return <Icons.flame {...props} className={cn(props.className, "text-chart-2")} />; /* Kynegos Blue */
        case 'otros':
        default:
            return <Icons.leaf {...props} className={cn(props.className, "text-chart-4")} />; /* Kynegos Gray */
    }
}
