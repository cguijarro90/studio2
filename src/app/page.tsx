import BiomassMapperClient from '@/components/biomass-mapper-client';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-background animate-pulse" />}>
      <BiomassMapperClient />
    </Suspense>
  );
}
