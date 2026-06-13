import React from 'react';
import { LayoutDashboard, Server, Database, Settings } from 'lucide-react';

export const LeftRail: React.FC = () => {
  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Server, label: 'Services', active: false },
    { icon: Database, label: 'Database', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-16 border-r border-neutral-800 bg-neutral-950 flex flex-col items-center py-6 gap-6 text-neutral-400 shrink-0">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            title={item.label}
            className={`group relative p-3 rounded-xl transition-all duration-300 ${
              item.active
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'hover:bg-neutral-900 hover:text-neutral-200 border border-transparent'
            }`}
          >
            <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs px-2.5 py-1 rounded shadow-xl opacity-0 scale-95 origin-left transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
