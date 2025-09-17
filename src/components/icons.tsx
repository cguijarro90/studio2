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
  kynegos: (props: LucideProps) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 180 40"
      {...props}
      fill="currentColor"
    >
      <path d="M27.9398 34.3415L27.9209 34.3312L18.4468 24.8571L18.4411 24.8514L18.4354 24.8571L8.96131 34.3312L8.94242 34.3415H0.353516V5.48047H9.0139V21.1118L18.4354 11.6903L18.4411 11.6846L18.4468 11.6903L27.8683 21.1118V5.48047H36.5287V34.3415H27.9398Z"/>
      <path d="M68.5133 28.5218C68.5133 31.8153 65.867 34.4616 62.5735 34.4616C59.28 34.4616 56.6337 31.8153 56.6337 28.5218V5.48047H47.9893V28.5218C47.9893 36.3267 54.3435 42.6809 62.5735 42.6809C70.8035 42.6809 77.1577 36.3267 77.1577 28.5218V5.48047H68.5133V28.5218Z"/>
      <path d="M109.841 34.3415L103.88 23.3601L97.9181 34.3415H88.1641L99.7892 16.2913L99.8032 16.2691L99.7892 16.2469L88.2358 0H97.9898L103.952 10.9814L109.914 0H119.668L108.114 16.2469L108.094 16.2758L108.114 16.3047L119.739 34.3415H109.841Z"/>
      <path d="M152.012 5.48047V34.3415H143.351V24.5126L135.295 34.3415H127.352L136.216 23.3275L127.279 5.48047H136.701L142.662 16.5053L142.67 16.518L142.678 16.5053L148.64 5.48047H152.012Z"/>
      <path d="M171.189 25.8016C174.015 23.8565 175.762 20.6125 175.762 16.9194C175.762 9.61053 169.601 4.3418 161.42 4.3418C153.238 4.3418 147.078 9.61053 147.078 16.9194C147.078 20.6125 148.825 23.8565 151.65 25.8016L143.205 39.542H153.645L157.371 33.1593H165.468L169.194 39.542H179.634L171.189 25.8016ZM161.42 25.437C156.444 25.437 155.722 11.2388 161.42 11.2388C167.117 11.2388 166.395 25.437 161.42 25.437Z"/>
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
