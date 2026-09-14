import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

import Hyperspeed, { HyperspeedOptions } from '@/components/ui/Hyperspeed';

const HYPERSPEED_OPTIONS: HyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3
  }
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-text-primary relative">
      {/* 3D Hyperspeed WebGL Background across all internal pages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <Hyperspeed effectOptions={HYPERSPEED_OPTIONS} />
        {/* Subtle glass overlay that keeps text crisp while 3D road and car light trails stream through */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav onToggleMobileMenu={() => setMobileOpen(prev => !prev)} />
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 scroll-smooth">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

