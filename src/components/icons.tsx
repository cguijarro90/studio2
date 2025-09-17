import type { LucideProps } from 'lucide-react';
import { Leaf, MapPin, Layers, Weight, Milestone, Route, X, Flame, Circle, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KynegosLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="160" height="36" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M22.0978 22.4817L11.5326 11.9165L14.735 8.71415L25.3002 19.2794L22.0978 22.4817Z" fill="#00FF99"/>
        <path d="M0 36V0H30.2223L19.6571 10.5652H30.2223V25.299L19.6571 35.8642L0 36Z" fill="#00FF99"/>
        <path d="M48.2435 25.4785V11.0871H53.5152V22.2766L61.6429 11.0871H67.4332L58.1189 23.7505L67.7025 35.8697H61.6429L53.5152 27.2223V35.8697H48.2435Z" fill="white"/>
        <path d="M78.892 25.4785C78.892 24.637 79.0307 23.8224 79.308 23.0347C79.5852 22.247 79.9866 21.5284 80.5119 20.8789C81.0372 20.2294 81.6703 19.675 82.4111 19.2157C83.1519 18.7564 83.9801 18.401 84.8958 18.1495C85.8115 17.898 86.7865 17.7722 87.8209 17.7722C89.2899 17.7722 90.5898 18.0686 91.7205 18.6612C92.8512 19.2539 93.728 19.9947 94.351 20.8837C94.974 21.7727 95.2855 22.7568 95.2855 23.836H90.0138C90.0138 23.1143 89.8446 22.5309 89.5062 22.0858C89.1678 21.6406 88.6907 21.3646 88.0749 21.2577C87.4591 21.1508 86.9125 21.0974 86.4354 21.0974C85.7335 21.0974 85.1118 21.236 24.5702 21.5132C84.0286 21.7904 83.5745 22.1893 83.2079 22.7101C82.8413 23.2309 82.658 23.89 82.658 24.6872V35.8697H78.892V25.4785Z" fill="white"/>
        <path d="M109.919 18.1495C111.758 17.8111 113.374 17.6419 114.766 17.6419C116.822 17.6419 118.358 18.0864 119.375 18.9754C120.392 19.8644 120.899 21.0974 120.899 22.6744V35.8697H115.628V23.165C115.628 22.4433 115.426 21.9026 115.022 21.543C114.618 21.1834 113.992 21.0036 113.144 21.0036C112.296 21.0036 111.419 21.2808 110.514 21.8351L109.919 18.1495Z" fill="white"/>
        <path d="M136.963 17.9026C138.802 17.9026 140.247 18.4234 141.299 19.4649C142.351 20.5065 142.876 21.8064 142.876 23.3646C142.876 24.9566 142.363 26.2751 141.336 27.3201C140.309 28.3651 138.864 28.8878 136.997 28.8878H131.794V35.8697H126.522V11.0871H136.963V17.9026ZM136.444 25.299C137.38 25.299 138.125 25.0315 138.68 24.4965C139.235 23.9615 139.512 23.2309 139.512 22.3047C139.512 21.4118 139.231 20.6971 138.67 20.1601C138.109 19.6231 137.362 19.3546 136.43 19.3546H131.794V25.299H136.444Z" fill="white"/>
        <path d="M159.202 11.0871L150.312 24.306V35.8697H145.04V11.0871H150.83L159.202 23.5786V11.0871H164.474V35.8697H158.414L150.312 23.0347" fill="white"/>
    </svg>
);


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
  kynegos: (props: React.SVGProps<SVGSVGElement>) => <KynegosLogo {...props} />,
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
