import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useApps } from '../hooks/useApps';
import { NodeInspector } from '../flow/NodeInspector';
import type { ServiceNode, ServiceStatus } from '../types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, Server, AlertTriangle, Layers, Menu } from 'lucide-react';

interface RightPanelProps {
  selectedNode: ServiceNode | null;
  onUpdateNode: (id: string, data: { name?: string; description?: string; value?: number; status?: ServiceStatus }) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ selectedNode, onUpdateNode }) => {
  const selectedAppId = useAppStore((state) => state.selectedAppId);
  const setSelectedAppId = useAppStore((state) => state.setSelectedAppId);
  const isMobilePanelOpen = useAppStore((state) => state.isMobilePanelOpen);
  const setIsMobilePanelOpen = useAppStore((state) => state.setIsMobilePanelOpen);

  const { data: apps, isLoading, isError, error } = useApps();

  // Automatically select the first app on mount if none is selected
  useEffect(() => {
    if (apps && apps.length > 0 && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps, selectedAppId, setSelectedAppId]);



  // Main Right Panel content
  const renderContent = () => (
    <div className="flex flex-col h-full gap-4 text-neutral-200">
      {/* Apps List Section */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Applications</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-xs">Loading apps...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-rose-400 py-4 text-xs bg-rose-950/20 border border-rose-900/50 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Failed to load: {error?.message || 'Unknown error'}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {apps?.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left border ${
                  selectedAppId === app.id
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-white shadow-inner shadow-indigo-500/5'
                    : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Server className={`h-4 w-4 shrink-0 ${selectedAppId === app.id ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <span className="truncate">{app.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Node Inspector Section */}
      <div className="flex-1 min-h-0">
        <NodeInspector node={selectedNode} onUpdateNode={onUpdateNode} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col h-full bg-neutral-950/40 p-4 border-l border-neutral-800 z-10 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Floating Panel Toggle for Mobile (Only if right panel is hidden on mobile) */}
      <div className="lg:hidden absolute bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMobilePanelOpen(true)}
          className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl flex items-center justify-center border border-indigo-500/30"
          title="Open Dashboard Panel"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet open={isMobilePanelOpen} onOpenChange={setIsMobilePanelOpen}>
        <SheetContent
          side="right"
          className="w-[320px] bg-neutral-950 border-l border-neutral-800 p-4 pt-10 text-white"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-base">Dashboard Controls</SheetTitle>
            <SheetDescription className="sr-only">
              Configure active applications and inspect selected graph nodes.
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)] overflow-y-auto pr-1">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
