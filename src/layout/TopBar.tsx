import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Cloud, Maximize2, Play, Activity } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    // Fit view with smooth transition
    fitView({ duration: 800 });
  };

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 flex items-center justify-between text-neutral-200 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Cloud className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            App Graph Builder
            <span className="text-xs font-normal text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              v1.0
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFitView}
          className="h-9 gap-1.5 border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
        >
          <Maximize2 className="h-4 w-4" />
          <span>Fit View</span>
        </Button>

        <Button
          size="sm"
          className="h-9 gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-medium"
          onClick={() => alert('Deployment started (Mock Action)')}
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Deploy</span>
        </Button>
      </div>
    </header>
  );
};
