import React, { useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ServiceStatus } from '../types';
import { Cpu, HardDrive, Globe, Layers, Settings } from 'lucide-react';

// PostgreSQL SVG Logo
const PostgresLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
    <svg className="w-5 h-5" viewBox="0 0 128 124" fill="currentColor">
      <path d="M109.9 83c-2.3 4.2-6 8.3-9 11.2-3.1 3-7.5 5.8-12 8.3-9 5.1-20.2 8-32.3 8-12 0-23.2-2.9-32.2-8C19.9 99.9 15.6 97 12.5 94c-3.1-2.9-6.8-7-9-11.2-3-5.2-3.5-11.2-3.5-18s.5-12.8 3.5-18c2.3-4.2 6-8.3 9.1-11.2C15.7 32.7 20 30 24.5 27.5c9-5.1 20.2-8 32.2-8 12.1 0 23.3 2.9 32.3 8 4.5 2.5 8.9 5.2 12 8.1 3.1 2.9 6.7 7 9 11.2 3 5.2 3.5 11.2 3.5 18s-.5 12.8-3.6 18z" fill="#336791"/>
      <path d="M109.9 83c-2.3-4.2-2.9-10.2-2.9-18s-.5-12.8-3.5-18c-2.3-4.2-6-8.3-9-11.2-3.1-3-7.5-5.8-12-8.3-9-5.1-20.2-8-32.2-8-12.1 0-23.3 2.9-32.3 8-4.5 2.5-8.9 5.2-12 8.1-3.1 2.9-6.7 7-9 11.2-3 5.2-3.5 11.2-3.5 18s.5 12.8 3.5 18c2.3 4.2 6 8.3 9.1 11.2 3.1 3 7.5 5.8 12 8.3 9 5.1 20.2 8 32.2 8s23.2-2.9 32.3-8c4.5-2.5 8.9-5.2 12-8.3 3.1-2.9 6.7-7 9-11.2z" stroke="#FFF" strokeWidth="2"/>
    </svg>
  </div>
);

// Redis SVG Logo
const RedisLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/20 flex items-center justify-center shrink-0">
    <svg className="w-5 h-5" viewBox="0 0 128 128" fill="none">
      <path d="M64 4L14 30.5v53L64 110l50-26.5v-53L64 4z" fill="#A41E11"/>
      <path d="M64 4L14 30.5L64 57l50-26.5L64 4z" fill="#D82C20"/>
      <path d="M64 57L14 83.5L64 110l50-26.5L64 57z" fill="#B12317"/>
    </svg>
  </div>
);

// MongoDB SVG Logo
const MongodbLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center shrink-0">
    <svg className="w-5.5 h-5.5" viewBox="0 0 128 128" fill="none">
      <path d="M64 2C64 2 34 32 34 72c0 23.2 13.4 34.6 30 38V2z" fill="#47A248"/>
      <path d="M64 2C64 2 94 32 94 72c0 23.2-13.4 34.6-30 38V2z" fill="#589636"/>
      <path d="M64 110c0 4.4-3.6 8-8 8s-8-3.6-8-8c0-8.8 16-12 16 0z" fill="#13aa52"/>
      <path d="M64 110c0 4.4 3.6 8 8 8s8-3.6 8-8c0-8.8-16-12-16 0z" fill="#118D4B"/>
    </svg>
  </div>
);

// AWS SMILE LOGO SVG
const AWSLogo = () => (
  <div className="flex flex-col items-end select-none opacity-90 shrink-0">
    <span className="text-[10px] font-black tracking-tighter text-white mr-2">aws</span>
    <svg className="w-9 h-2.5 text-amber-500" viewBox="0 0 35 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3C10 7.5 24 7.5 30 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 3L27 1M30 3L29 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

export interface BaseNodeProps {
  id: string;
  selected?: boolean;
  accentColor: 'blue' | 'green';
  typeLabel: 'Service' | 'Database';
  typeColorClass: string;
  defaultIcon: React.ReactNode;
  name: string;
  value: number;
  status: ServiceStatus;
  priceLabel?: string;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  selected,
  accentColor,
  typeLabel,
  typeColorClass,
  defaultIcon,
  name,
  value,
  status,
  priceLabel = '$0.03/HR',
}) => {
  const touchStartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    // Only capture long press on mobile viewports (< 1024px)
    if (window.innerWidth >= 1024) return;

    if (touchStartTimeout.current) {
      clearTimeout(touchStartTimeout.current);
    }

    touchStartTimeout.current = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('node-long-press', {
          detail: { id, name }
        })
      );
    }, 600); // 600ms hold time
  };

  const handleTouchEnd = () => {
    if (touchStartTimeout.current) {
      clearTimeout(touchStartTimeout.current);
      touchStartTimeout.current = null;
    }
  };

  const handleTouchMove = () => {
    if (touchStartTimeout.current) {
      clearTimeout(touchStartTimeout.current);
      touchStartTimeout.current = null;
    }
  };

  // Determine Logo to show based on node name and type
  const getBrandLogo = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    if (typeLabel === 'Database') {
      if (lower.includes('postgres')) return <PostgresLogo />;
      if (lower.includes('redis')) return <RedisLogo />;
      if (lower.includes('mongo')) return <MongodbLogo />;
    }
    
    // Default fallback icon
    return (
      <div className={`w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 ${typeColorClass}`}>
        {defaultIcon}
      </div>
    );
  };

  // Status visual styles
  const statusStyles = {
    healthy: {
      bg: 'bg-emerald-950/30 border-emerald-500/35 text-emerald-400',
      text: 'Success',
    },
    degraded: {
      bg: 'bg-rose-950/30 border-rose-500/35 text-rose-400',
      text: 'Error',
    },
    down: {
      bg: 'bg-rose-950/30 border-rose-500/35 text-rose-400',
      text: 'Error',
    },
  };

  const currentStatus = statusStyles[status] || statusStyles.healthy;

  // Derive metrics values from 'value' state
  const cpuValue = (value / 100).toFixed(2);
  const memoryValue = ((value * 2.5) / 100).toFixed(2) + ' GB';
  const diskValue = '10.00 GB';
  const regionValue = '1';

  // Accent-specific classes for container border and rings when selected
  const accentClasses =
    accentColor === 'blue'
      ? selected
        ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-600/10 scale-[1.02]'
        : 'border-neutral-800 hover:border-blue-800/80'
      : selected
        ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-600/10 scale-[1.02]'
        : 'border-neutral-800 hover:border-emerald-800/80';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`w-80 rounded-2xl bg-[#090a0d] border shadow-2xl transition-all duration-300 overflow-hidden text-neutral-200 select-none ${accentClasses}`}
    >
      {/* Target handle on Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-3 !h-3 !bg-neutral-800 border-2 !border-neutral-700 hover:!bg-indigo-500 transition-colors"
      />

      <div className="p-4 flex flex-col gap-4">
        {/* Header (Logo, Name, Price, Settings) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {getBrandLogo(name)}
            <div className="flex flex-col min-w-0">
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${typeColorClass} leading-none mb-1`}>
                [ {typeLabel} ]
              </span>
              <h4 className="text-sm font-semibold text-white truncate max-w-[125px]" title={name}>
                {name || typeLabel}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-semibold">
              {priceLabel}
            </span>
            <button className="p-1.5 rounded-md hover:bg-neutral-850 text-neutral-500 hover:text-neutral-200 transition-colors">
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Metric Numbers & Tabs */}
        <div className="flex flex-col gap-1.5">
          {/* Numbers */}
          <div className="grid grid-cols-4 text-center text-[10.5px] font-bold font-mono text-neutral-300">
            <div>{cpuValue}</div>
            <div>{memoryValue}</div>
            <div>{diskValue}</div>
            <div>{regionValue}</div>
          </div>
          {/* Labels / Metric Toggles */}
          <div className="grid grid-cols-4 gap-1">
            {/* CPU Active */}
            <div className="bg-white text-neutral-950 rounded flex items-center justify-center gap-1 py-1 font-bold text-[9px]">
              <Cpu className="h-2.5 w-2.5 shrink-0" strokeWidth={3} />
              <span>CPU</span>
            </div>
            {/* Memory Inactive */}
            <div className="bg-neutral-800/40 border border-neutral-850 text-neutral-400 rounded flex items-center justify-center gap-1 py-1 font-medium text-[9px]">
              <Layers className="h-2.5 w-2.5 shrink-0" />
              <span>Memory</span>
            </div>
            {/* Disk Inactive */}
            <div className="bg-neutral-800/40 border border-neutral-850 text-neutral-400 rounded flex items-center justify-center gap-1 py-1 font-medium text-[9px]">
              <HardDrive className="h-2.5 w-2.5 shrink-0" />
              <span>Disk</span>
            </div>
            {/* Region Inactive */}
            <div className="bg-neutral-800/40 border border-neutral-850 text-neutral-400 rounded flex items-center justify-center gap-1 py-1 font-medium text-[9px]">
              <Globe className="h-2.5 w-2.5 shrink-0" />
              <span>Region</span>
            </div>
          </div>
        </div>

        {/* Rainbow Gradient Slider representation */}
        <div className="flex items-center gap-2">
          {/* Slider track container */}
          <div className="flex-1 h-1.5 rounded-full bg-neutral-800 relative overflow-visible">
            {/* Active coloring track - only up to value% */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-rose-500"
              style={{ width: `${value}%` }}
            />
            {/* Handle positioned based on value */}
            <div
              className="absolute w-3.5 h-3.5 bg-white rounded-full border border-neutral-500 shadow -top-1"
              style={{ left: `calc(${value}% - 7px)` }}
            />
          </div>
          {/* Input display */}
          <div className="px-2 py-0.5 rounded border border-neutral-800 bg-[#060709] text-center font-mono text-xs w-12 text-neutral-400">
            {cpuValue}
          </div>
        </div>

        {/* Bottom Bar: Health success/error status, AWS logo */}
        <div className="flex items-center justify-between border-t border-neutral-800/60 pt-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${currentStatus.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            <span>{currentStatus.text}</span>
          </div>
          <AWSLogo />
        </div>
      </div>

      {/* Source handle on Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-3 !h-3 !bg-neutral-800 border-2 !border-neutral-700 hover:!bg-indigo-500 transition-colors"
      />
    </div>
  );
};
