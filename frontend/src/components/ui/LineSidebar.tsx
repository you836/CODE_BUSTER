import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LineSidebar.css';

const FALLOFF_CURVES: Record<string, (p: number) => number> = {
  linear: p => p,
  smooth: p => p * p * (3 - 2 * p),
  sharp: p => p * p * p
};

export type SidebarItem = string | {
  name: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const DEFAULT_ITEMS = [
  'Overview',
  'Components',
  'Animations',
  'Backgrounds',
  'Showcase',
  'Playground',
  'Templates',
  'Changelog',
  'Community',
  'Resources',
  'Documentation',
  'Support'
];

export interface LineSidebarProps {
  items?: (string | SidebarItem)[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  showIcons?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: 'linear' | 'smooth' | 'sharp';
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  active?: number | null;
  onItemClick?: (index: number, label: string, item: SidebarItem) => void;
  className?: string;
}

const LineSidebar: React.FC<LineSidebarProps> = ({
  items = DEFAULT_ITEMS,
  accentColor = '#06B6D4',
  textColor = '#94a3b8',
  markerColor = '#475569',
  showIndex = true,
  showMarker = true,
  showIcons = true,
  proximityRadius = 100,
  maxShift = 24,
  falloff = 'smooth',
  markerLength = 28,
  markerGap = 8,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 12,
  fontSize = 0.95,
  smoothing = 100,
  defaultActive = null,
  active = undefined,
  onItemClick,
  className = ''
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const smoothingRef = useRef(smoothing);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(defaultActive);

  const activeIndex = active !== undefined ? active : internalActiveIndex;
  const activeRef = useRef(activeIndex);

  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  // Single rAF loop that eases every item's --effect toward its target using
  // frame-rate independent exponential smoothing
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const itemsElements = itemRefs.current;
    for (let i = 0; i < itemsElements.length; i++) {
      const el = itemsElements[i];
      if (!el) continue;
      const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty('--effect', value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const itemsElements = itemRefs.current;
      for (let i = 0; i < itemsElements.length; i++) {
        const el = itemsElements[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string, item: SidebarItem) => {
      setInternalActiveIndex(index);
      onItemClick?.(index, label, item);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
  }, [activeIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  return (
    <nav
      className={`line-sidebar${showMarker ? ' line-sidebar--markers' : ''}${scaleTick ? ' line-sidebar--scale-tick' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`
      } as React.CSSProperties}
    >
      <ul
        ref={listRef}
        className="line-sidebar__list"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {items.map((item, index) => {
          const label = typeof item === 'string' ? item : item.name;
          const path = typeof item === 'object' ? item.path : undefined;
          const Icon = typeof item === 'object' && item.icon ? item.icon : null;
          const isCurrent = activeIndex === index;

          const itemContent = (
            <>
              {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
              <span className="line-sidebar__label">
                {showIndex && (
                  <span className="line-sidebar__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
                {showIcons && Icon && (
                  <span className="line-sidebar__icon">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <span className="line-sidebar__text">{label}</span>
              </span>
            </>
          );

          return (
            <li
              key={`${label}-${index}`}
              ref={el => {
                itemRefs.current[index] = el;
              }}
              className="line-sidebar__item"
              aria-current={isCurrent ? 'true' : undefined}
            >
              {path ? (
                <Link
                  to={path}
                  className="line-sidebar__link"
                  onClick={() => handleClick(index, label, item)}
                >
                  {itemContent}
                </Link>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  className="line-sidebar__link cursor-pointer"
                  onClick={() => handleClick(index, label, item)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick(index, label, item);
                    }
                  }}
                >
                  {itemContent}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LineSidebar;
