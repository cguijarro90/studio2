import type { LucideProps } from 'lucide-react';
import { Leaf, MapPin, Layers, Weight, Milestone, Route, X, Flame, Circle, Crosshair, Recycle, Zap, Wheat, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Icons = {
  leaf: (props: LucideProps) => <Leaf {...props} />,
  pin: (props: LucideProps) => <MapPin {...props} />,
  searchPin: (props: LucideProps) => <MapPin {...props} />,
  layers: (props: LucideProps) => <Layers {...props} />,
  weight: (props: LucideProps) => <Weight {...props} />,
  zap: (props: LucideProps) => <Zap {...props} />,
  distance: (props: LucideProps) => <Route {...props} />,
  radius: (props: LucideProps) => <Milestone {...props} />,
  close: (props: LucideProps) => <X {...props} />,
  flame: (props: LucideProps) => <Flame {...props} />,
  circle: (props: LucideProps) => <Circle {...props} />,
  crosshair: (props: LucideProps) => <Crosshair {...props} />,
  recycle: (props: LucideProps) => <Recycle {...props} />,
  wheat: (props: LucideProps) => <Wheat {...props} />,
  trees: (props: LucideProps) => <Trees {...props} />,
  kynegosLogo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="120"
      height="35"
      viewBox="0 0 133 38"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.3826 3.16113H19.0664V34.5008H12.3826V3.16113Z" />
      <path d="M22.0621 3.16113H33.5674L36.0097 12.115H36.1082C35.086 8.35124 34.0638 3.16113 28.5366 3.16113C24.0323 3.16113 22.1114 7.23595 22.1114 11.9667V34.5008H28.7951V12.8757C28.7951 9.40893 29.8666 7.64104 32.2596 7.64104C33.2818 7.64104 34.2054 8.00529 35.0367 8.77463L31.6946 3.16113H22.0621Z" />
      <path d="M47.7853 3.16113L40.0099 26.602L39.8129 3.16113H33.1292V34.5008H38.5204L46.493 11.2059L46.6899 34.5008H53.3737V3.16113H47.7853Z" />
      <path d="M55.7648 3.16113H62.4485V34.5008H55.7648V3.16113Z" />
      <path d="M81.5683 23.4146C82.1839 26.0401 81.3526 27.5029 78.6137 27.5029C75.8255 27.5029 74.458 25.8427 74.458 22.8683C74.458 17.6288 78.4165 14.9048 83.2121 14.9048C84.7237 14.9048 86.1901 15.0033 87.5576 15.3182L85.9458 20.3739C84.8743 20.127 83.9014 20.0285 83.1136 20.0285C81.1927 20.0285 80.0227 21.0507 80.0227 22.77c8e-05 2.1952 1.4172 3.1188 3.5356 3.1188C85.4267 25.8888 86.4982 24.8173 86.9906 23.4146H81.5683Z" />
      <path d="M69.0474 3.16113L63.5695 21.1837L63.3725 3.16113H56.6887V34.5008H62.0799L67.6071 16.3298L67.8041 34.5008H74.4878V3.16113H69.0474Z" />
      <path d="M102.775 3.16113L93.1802 34.5008H99.9625L101.429 28.5366H111.416L112.537 34.5008H119.665L110.12 3.16113H102.775ZM106.398 23.0195L109.137 12.115H109.284L112.023 23.0195H106.398Z" />
      <path d="M119.566 3.16113H126.25V34.5008H119.566V3.16113Z" />
    </svg>
  ),
};

// Returns uncolored icon for map pins
export function getBiomassIcon(type: string, className?: string) {
    const props = { className: cn("w-4 h-4", className) };
    const lowerCaseType = type?.toLowerCase() || '';

    if (lowerCaseType.includes('biomasa')) {
        return <Icons.leaf {...props} />;
    }
    if (lowerCaseType.includes('cogeneración')) {
        return <Icons.flame {...props} />;
    }
    if (lowerCaseType.includes('residuos')) {
        return <Icons.recycle {...props} />;
    }
    return <Icons.circle {...props} />;
}

// Returns colored icon for UI elements like lists and legends
export function getColoredBiomassIcon(type: string, className?: string) {
    const props = { className: cn("w-4 h-4", className) };
    const lowerCaseType = type?.toLowerCase() || '';

    if (lowerCaseType.includes('biomasa')) {
        return <Icons.leaf {...props} className={cn(props.className, "text-chart-3")} />;
    }
    if (lowerCaseType.includes('cogeneración')) {
        return <Icons.flame {...props} className={cn(props.className, "text-chart-2")} />;
    }
    if (lowerCaseType.includes('residuos')) {
        return <Icons.recycle {...props} className={cn(props.className, "text-chart-4")} />;
    }
    return <Icons.circle {...props} className={cn(props.className, "text-chart-1")} />;
}

    
